import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEventos } from "@/hooks/use-eventos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventosTableProps {
  funcionarioId?: string;
}

const tipoEventoLabels = {
  admissao: "Admissão",
  demissao: "Demissão",
  atualizacao: "Atualização",
  reativacao: "Reativação",
};

const tipoEventoColors = {
  admissao: "default",
  demissao: "destructive",
  atualizacao: "secondary",
  reativacao: "default",
} as const;

export function EventosTable({ funcionarioId }: EventosTableProps) {
  const { data: eventos, isLoading, error } = useEventos(funcionarioId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Histórico de Eventos
          </CardTitle>
          <CardDescription>Carregando eventos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Erro ao carregar eventos</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Histórico de Eventos
        </CardTitle>
        <CardDescription>
          Registro completo de todas as mudanças {funcionarioId ? "deste funcionário" : "dos funcionários"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {eventos && eventos.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  {!funcionarioId && <TableHead>Funcionário</TableHead>}
                  <TableHead>Tipo de Evento</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.map((evento) => (
                  <TableRow key={evento.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(evento.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    {!funcionarioId && (
                      <TableCell>
                        <div>
                          <div className="font-medium">{evento.funcionarios?.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            CPF: {evento.funcionarios?.cpf}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={tipoEventoColors[evento.tipo_evento]}>
                        {tipoEventoLabels[evento.tipo_evento]}
                      </Badge>
                    </TableCell>
                    <TableCell>{evento.descricao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum evento registrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
