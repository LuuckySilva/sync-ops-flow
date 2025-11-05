import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2, UserPlus, Mail, UserX, Loader2 } from "lucide-react";
import { FilterBar } from "@/components/common/FilterBar";
import { BatchActionBar } from "@/components/common/BatchActionBar";
import { useToastFeedback } from "@/hooks/use-toast-feedback";
import { FuncionarioFormDialog } from "./FuncionarioFormDialog";
import { useFuncionarios, useDeleteFuncionario } from "@/hooks/use-funcionarios";

export const FuncionariosTable = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSetor, setFilterSetor] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { showSuccess } = useToastFeedback();

  // Fetch funcionários da API
  const { data: funcionarios = [], isLoading, error } = useFuncionarios();
  const deleteFuncionario = useDeleteFuncionario();

  const filteredFuncionarios = useMemo(() => {
    return funcionarios.filter((f) => {
      const matchesSearch = 
        f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cpf.includes(searchTerm);
      const matchesSetor = !filterSetor || f.setor === filterSetor;
      return matchesSearch && matchesSetor;
    });
  }, [funcionarios, searchTerm, filterSetor]);

  const setores = useMemo(() => 
    Array.from(new Set(funcionarios.map((f) => f.setor))),
    [funcionarios]
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredFuncionarios.map((f) => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleBatchDelete = () => {
    showSuccess(`${selectedIds.length} funcionário(s) removido(s) com sucesso`);
    setSelectedIds([]);
  };

  const handleBatchEmail = () => {
    showSuccess(`E-mail enviado para ${selectedIds.length} funcionário(s)`);
    setSelectedIds([]);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterSetor("");
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja desativar este funcionário?')) {
      deleteFuncionario.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <p>Erro ao carregar funcionários. Tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Funcionários</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os funcionários da empresa • {filteredFuncionarios.length} encontrado(s)
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Novo Funcionário
        </Button>
      </div>

      <FilterBar
        searchPlaceholder="Buscar por nome ou CPF..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterChange={(key, value) => {
          if (key === "setor") setFilterSetor(value);
        }}
        filters={[
          {
            key: "setor",
            label: "Filtrar por setor",
            options: setores.map((s) => ({ value: s, label: s })),
          },
        ]}
        onClearFilters={handleClearFilters}
      />

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredFuncionarios.length && filteredFuncionarios.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Data Admissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFuncionarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
                  Nenhum funcionário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredFuncionarios.map((funcionario) => (
                <TableRow key={funcionario.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(funcionario.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(funcionario.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{funcionario.nome}</TableCell>
                  <TableCell>{funcionario.cpf}</TableCell>
                  <TableCell>{funcionario.cargo}</TableCell>
                  <TableCell>{funcionario.setor}</TableCell>
                  <TableCell>
                    {new Date(funcionario.data_admissao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={funcionario.ativo ? "default" : "secondary"}>
                      {funcionario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(funcionario.id)}
                        disabled={deleteFuncionario.isPending}
                      >
                        {deleteFuncionario.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BatchActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        actions={[
          {
            label: "Enviar E-mail",
            icon: <Mail className="w-4 h-4" />,
            onClick: handleBatchEmail,
            variant: "secondary",
          },
          {
            label: "Remover",
            icon: <UserX className="w-4 h-4" />,
            onClick: handleBatchDelete,
            variant: "destructive",
          },
        ]}
      />

      <FuncionarioFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          // Reload funcionarios
        }}
      />
    </div>
  );
};
