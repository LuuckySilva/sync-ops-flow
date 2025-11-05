import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToastFeedback } from "@/hooks/use-toast-feedback";
import { Upload, X, FileText, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (formato: 000.000.000-00)"),
  cargo: z.string().min(2, "Cargo é obrigatório"),
  setor: z.string().min(2, "Setor é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  data_admissao: z.string().min(1, "Data de admissão é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

interface FuncionarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const FuncionarioFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: FuncionarioFormDialogProps) => {
  const { showSuccess, showError } = useToastFeedback();
  const [foto, setFoto] = useState<File | null>(null);
  const [documentos, setDocumentos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      cargo: "",
      setor: "",
      email: "",
      telefone: "",
      data_admissao: new Date().toISOString().split("T")[0],
    },
  });

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("Foto deve ter no máximo 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showError("Arquivo deve ser uma imagem");
        return;
      }
      setFoto(file);
    }
  };

  const handleDocumentosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        showError(`${file.name} excede 10MB`);
        return false;
      }
      return true;
    });
    setDocumentos((prev) => [...prev, ...validFiles]);
  };

  const removeDocumento = (index: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Insert funcionario
      const { data: funcionario, error: funcError } = await supabase
        .from("funcionarios")
        .insert({
          nome: values.nome,
          cpf: values.cpf,
          cargo: values.cargo,
          setor: values.setor,
          email: values.email || null,
          telefone: values.telefone || null,
          data_admissao: values.data_admissao,
          ativo: true,
        })
        .select()
        .single();

      if (funcError) throw funcError;

      // Upload foto
      if (foto && funcionario) {
        const fotoPath = `funcionarios/${funcionario.id}/foto.${foto.name.split(".").pop()}`;
        const { error: fotoError } = await supabase.storage
          .from("uploads")
          .upload(fotoPath, foto);

        if (fotoError) console.error("Erro ao enviar foto:", fotoError);
      }

      // Upload documentos
      if (documentos.length > 0 && funcionario) {
        for (const doc of documentos) {
          const docPath = `funcionarios/${funcionario.id}/documentos/${doc.name}`;
          const { error: docError } = await supabase.storage
            .from("uploads")
            .upload(docPath, doc);

          if (docError) console.error(`Erro ao enviar ${doc.name}:`, docError);
        }
      }

      showSuccess("Funcionário cadastrado com sucesso!");
      form.reset();
      setFoto(null);
      setDocumentos([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);
      showError("Erro ao cadastrar funcionário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Funcionário</DialogTitle>
          <DialogDescription>
            Preencha os dados do funcionário e anexe foto e documentos
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF *</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_admissao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Admissão *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Operador">Operador</SelectItem>
                        <SelectItem value="Motorista">Motorista</SelectItem>
                        <SelectItem value="Mecânico">Mecânico</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="setor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Operacional">Operacional</SelectItem>
                        <SelectItem value="Administrativo">Administrativo</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Logística">Logística</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="joao@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div>
                <FormLabel className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Foto do Funcionário
                </FormLabel>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("foto-upload")?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {foto ? "Trocar Foto" : "Adicionar Foto"}
                  </Button>
                  <input
                    id="foto-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                </div>
                {foto && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {foto.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setFoto(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <FormLabel className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Documentos Iniciais
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("docs-upload")?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Documentos
                </Button>
                <input
                  id="docs-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleDocumentosChange}
                />
                {documentos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {documentos.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <FileText className="w-4 h-4" />
                        {doc.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto"
                          onClick={() => removeDocumento(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Cadastrando..." : "Cadastrar Funcionário"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
