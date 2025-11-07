import { useState } from "react";
import { mockCombustivel } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Fuel, Plus, FileUp, Download } from "lucide-react";

export const CombustivelTable = () => {
  const [registros] = useState(mockCombustivel);

  const totalLitros = registros.reduce((sum, reg) => sum + reg.litros, 0);
  const totalValor = registros.reduce((sum, reg) => sum + reg.valor_total, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Controle de Combustível</h2>
          <p className="text-sm text-muted-foreground">
            Registros de abastecimento de equipamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileUp className="w-4 h-4" />
            Importar
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Abastecimento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Fuel className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Litros</p>
              <p className="text-2xl font-bold">{totalLitros.toFixed(1)}L</p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-warning/10">
              <Fuel className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold">
                {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Código NFC-e</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Litros</TableHead>
              <TableHead>Preço/Litro</TableHead>
              <TableHead>Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>
                  {new Date(reg.data).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {reg.codigo_nfce}
                </TableCell>
                <TableCell className="font-medium">{reg.equipamento}</TableCell>
                <TableCell>{reg.litros.toFixed(1)}L</TableCell>
                <TableCell>
                  {reg.preco_litro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="font-medium">
                  {reg.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
