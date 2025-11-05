import { useState } from "react";
import { mockMateriais } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, Plus, FileUp, Download } from "lucide-react";

export const MateriaisTable = () => {
  const [materiais] = useState(mockMateriais);

  const totalGeral = materiais.reduce((sum, mat) => sum + mat.valor_total, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Controle de Materiais</h2>
          <p className="text-sm text-muted-foreground">
            Registro de consumo de materiais e insumos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileUp className="w-4 h-4" />
            Importar
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Registro
          </Button>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Gasto no Período</p>
            <p className="text-2xl font-bold">
              {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Local de Uso</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Valor Unit.</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Autorizado Por</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materiais.map((mat) => (
              <TableRow key={mat.id}>
                <TableCell>
                  {new Date(mat.data).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="font-medium">{mat.descricao}</TableCell>
                <TableCell>{mat.local_uso}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {mat.categoria}
                  </span>
                </TableCell>
                <TableCell>{mat.quantidade}</TableCell>
                <TableCell>
                  {mat.valor_unitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="font-medium">
                  {mat.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{mat.autorizado_por}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
