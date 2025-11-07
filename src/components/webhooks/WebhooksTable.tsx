import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWebhooks, useDeleteWebhook, useUpdateWebhook, Webhook } from "@/hooks/use-webhooks";
import { WebhookDialog } from "./WebhookDialog";
import { Edit, Plus, Trash2, Webhook as WebhookIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function WebhooksTable() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);

  const { data: webhooks, isLoading, error } = useWebhooks();
  const deleteWebhook = useDeleteWebhook();
  const updateWebhook = useUpdateWebhook();

  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedWebhook(undefined);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setWebhookToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (webhookToDelete) {
      deleteWebhook.mutate(webhookToDelete);
      setDeleteDialogOpen(false);
      setWebhookToDelete(null);
    }
  };

  const toggleAtivo = (webhook: Webhook) => {
    updateWebhook.mutate({
      id: webhook.id,
      ativo: !webhook.ativo,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WebhookIcon className="w-5 h-5" />
            Webhooks Configurados
          </CardTitle>
          <CardDescription>Carregando webhooks...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Erro ao carregar webhooks</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <WebhookIcon className="w-5 h-5" />
                Webhooks Configurados
              </CardTitle>
              <CardDescription>
                Gerencie webhooks para receber notificações de eventos
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks && webhooks.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Estatísticas</TableHead>
                    <TableHead>Último Envio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.nome}</TableCell>
                      <TableCell className="max-w-xs truncate">{webhook.url}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {webhook.eventos.map((evento) => (
                            <Badge key={evento} variant="secondary" className="text-xs">
                              {evento}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={webhook.ativo ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleAtivo(webhook)}
                        >
                          {webhook.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Envios: {webhook.total_envios}</div>
                          <div className="text-muted-foreground">
                            Erros: {webhook.total_erros}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {webhook.ultimo_envio
                          ? format(new Date(webhook.ultimo_envio), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })
                          : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(webhook)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(webhook.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum webhook configurado. Clique em "Novo Webhook" para começar.
            </div>
          )}
        </CardContent>
      </Card>

      <WebhookDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        webhook={selectedWebhook}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este webhook? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
