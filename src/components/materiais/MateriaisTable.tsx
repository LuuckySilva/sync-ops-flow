import { useState, useRef } from "react";
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
import { Package, Plus, Upload, Download, Loader2 } from "lucide-react";
import { excelApi } from "@/services/excel-api";
import { toast } from "sonner";

export const MateriaisTable = () => {
  const [materiais] = useState(mockMateriais);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalGeral = materiais.reduce((sum, mat) => sum + mat.valor_total, 0);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await excelApi.exportMateriais();
      toast.success('Planilha exportada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar planilha');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await excelApi.importMateriais(file);
      toast.success(`${result.criados} registros importados com sucesso!`);
      if (result.erros > 0) {
        toast.warning(`${result.erros} registros com erro`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao importar planilha');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Importar
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exportar Excel
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
