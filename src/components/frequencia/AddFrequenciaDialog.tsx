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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useCreateFrequencia } from "@/hooks/use-frequencia";
import { useFuncionarios } from "@/hooks/use-funcionarios";

const formSchema = z.object({
  funcionario_id: z.string().min(1, "Selecione um funcionário"),
  data: z.string().min(1, "Data é obrigatória"),
  hora_entrada: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:MM)"),
  hora_saida: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:MM)").optional().or(z.literal("")),
  tipo_dia: z.enum(["util", "feriado", "fim_de_semana"]),
  observacao: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFrequenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddFrequenciaDialog = ({
  open,
  onOpenChange,
}: AddFrequenciaDialogProps) => {
  const createFrequencia = useCreateFrequencia();
  const { data: funcionarios = [] } = useFuncionarios({ ativo: true });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      funcionario_id: "",
      data: new Date().toISOString().split("T")[0],
      hora_entrada: "",
      hora_saida: "",
      tipo_dia: "util",
      observacao: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createFrequencia.mutateAsync({
        funcionario_id: values.funcionario_id,
        data: values.data,
        hora_entrada: values.hora_entrada,
        hora_saida: values.hora_saida || undefined,
        tipo_dia: values.tipo_dia,
        observacao: values.observacao || undefined,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao registrar frequência:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Frequência</DialogTitle>
          <DialogDescription>
            Adicione um novo registro de ponto
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="funcionario_id"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Funcionário *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o funcionário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {funcionarios.map((func) => (
                          <SelectItem key={func.id} value={func.id}>
                            {func.nome} - {func.cargo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_dia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Dia *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="util">Dia Útil</SelectItem>
                        <SelectItem value="feriado">Feriado</SelectItem>
                        <SelectItem value="fim_de_semana">Fim de Semana</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hora_entrada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Entrada *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hora_saida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Saída</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Adicione observações se necessário"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createFrequencia.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createFrequencia.isPending}>
                {createFrequencia.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Frequência"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
