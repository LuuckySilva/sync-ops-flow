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
import { Clock, FileUp, Download, Loader2 } from "lucide-react";
import { useFrequencia } from "@/hooks/use-frequencia";

export const FrequenciaTable = () => {
  const { data: registros = [], isLoading, error } = useFrequencia();

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
        <p>Erro ao carregar registros de frequência</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Controle de Frequência</h2>
          <p className="text-sm text-muted-foreground">
            Registros de ponto e horas trabalhadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileUp className="w-4 h-4" />
            Importar Planilha
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Saída</TableHead>
              <TableHead>Total Horas</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                  Nenhum registro de frequência encontrado
                </TableCell>
              </TableRow>
            ) : (
              registros.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell className="font-medium">{reg.nome}</TableCell>
                <TableCell>
                  {new Date(reg.data).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  {reg.hora_entrada ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {reg.hora_entrada}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {reg.hora_saida ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {reg.hora_saida}
                    </div>
                  ) : (
                    <Badge variant="destructive">Sem saída</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {reg.total_horas ? (
                    <span className="font-medium">{reg.total_horas}h</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={reg.tipo_dia === 'util' ? 'default' : 'secondary'}>
                    {reg.tipo_dia === 'util' ? 'Útil' : 
                     reg.tipo_dia === 'feriado' ? 'Feriado' : 'Fim de semana'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {reg.observacao && (
                    <span className="text-sm text-muted-foreground">
                      {reg.observacao}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
