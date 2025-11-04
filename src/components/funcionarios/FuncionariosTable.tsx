import { useState } from "react";
import { mockFuncionarios } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, UserPlus } from "lucide-react";

export const FuncionariosTable = () => {
  const [funcionarios] = useState(mockFuncionarios);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Funcionários</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os funcionários da empresa
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Funcionário
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionarios.map((func) => (
              <TableRow key={func.id}>
                <TableCell className="font-medium">{func.nome}</TableCell>
                <TableCell>{func.cpf}</TableCell>
                <TableCell>{func.cargo}</TableCell>
                <TableCell>{func.setor}</TableCell>
                <TableCell>
                  {new Date(func.data_admissao).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Badge variant={func.ativo ? "default" : "secondary"}>
                    {func.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
