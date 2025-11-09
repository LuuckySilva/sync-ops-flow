import { useState, useRef } from "react";
import { mockAlimentacao } from "@/lib/mock-data";
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
import { UtensilsCrossed, Upload, Download, Loader2 } from "lucide-react";
import { excelApi } from "@/services/excel-api";
import { toast } from "sonner";

export const AlimentacaoTable = () => {
  const [registros] = useState(mockAlimentacao);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalGeral = registros.reduce((sum, reg) => sum + reg.total_dia, 0);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await excelApi.exportAlimentacao();
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
      const result = await excelApi.importAlimentacao(file);
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
          <h2 className="text-2xl font-bold">Controle de Alimentação</h2>
          <p className="text-sm text-muted-foreground">
            Registros de refeições fornecidas
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
            Importar Planilha
          </Button>
          <Button 
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total do Período</p>
              <p className="text-2xl font-bold">
                {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success/10">
              <UtensilsCrossed className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cafés da Manhã</p>
              <p className="text-2xl font-bold">
                {registros.filter(r => r.tipo_refeicao === 'cafe').length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/10">
              <UtensilsCrossed className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Almoços</p>
              <p className="text-2xl font-bold">
                {registros.filter(r => r.tipo_refeicao === 'almoco').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Valor Unit.</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell className="font-medium">{reg.nome}</TableCell>
                <TableCell>
                  {new Date(reg.data).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Badge variant={reg.tipo_refeicao === 'cafe' ? 'secondary' : 'default'}>
                    {reg.tipo_refeicao === 'cafe' ? 'Café' : 'Almoço'}
                  </Badge>
                </TableCell>
                <TableCell>{reg.fornecedor}</TableCell>
                <TableCell>{reg.quantidade}</TableCell>
                <TableCell>
                  {reg.valor_unitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="font-medium">
                  {reg.total_dia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
