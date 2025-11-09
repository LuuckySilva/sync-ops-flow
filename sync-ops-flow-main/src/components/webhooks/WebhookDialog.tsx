import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateWebhook, useUpdateWebhook, Webhook } from "@/hooks/use-webhooks";

interface WebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: Webhook;
}

const eventosDisponiveis = [
  { id: "admissao", label: "Admissões" },
  { id: "demissao", label: "Demissões" },
  { id: "atualizacao", label: "Atualizações" },
  { id: "reativacao", label: "Reativações" },
];

export function WebhookDialog({ open, onOpenChange, webhook }: WebhookDialogProps) {
  const [nome, setNome] = useState(webhook?.nome || "");
  const [url, setUrl] = useState(webhook?.url || "");
  const [secretKey, setSecretKey] = useState(webhook?.secret_key || "");
  const [ativo, setAtivo] = useState(webhook?.ativo ?? true);
  const [eventosSelecionados, setEventosSelecionados] = useState<string[]>(
    webhook?.eventos || []
  );

  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (eventosSelecionados.length === 0) {
      return;
    }

    const webhookData = {
      nome,
      url,
      secret_key: secretKey || undefined,
      eventos: eventosSelecionados,
      ativo,
      headers: {},
    };

    if (webhook) {
      updateWebhook.mutate(
        { id: webhook.id, ...webhookData },
        {
          onSuccess: () => {
            onOpenChange(false);
            resetForm();
          },
        }
      );
    } else {
      createWebhook.mutate(webhookData, {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setNome("");
    setUrl("");
    setSecretKey("");
    setAtivo(true);
    setEventosSelecionados([]);
  };

  const toggleEvento = (eventoId: string) => {
    setEventosSelecionados((prev) =>
      prev.includes(eventoId)
        ? prev.filter((id) => id !== eventoId)
        : [...prev, eventoId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{webhook ? "Editar" : "Novo"} Webhook</DialogTitle>
            <DialogDescription>
              Configure um webhook para receber notificações de eventos
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Sistema de RH"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL do Webhook</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seu-dominio.com/webhook"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secret">Chave Secreta (opcional)</Label>
              <Input
                id="secret"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Será enviada no header X-Webhook-Secret"
              />
            </div>
            <div className="grid gap-2">
              <Label>Eventos para Notificar</Label>
              <div className="space-y-2">
                {eventosDisponiveis.map((evento) => (
                  <div key={evento.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={evento.id}
                      checked={eventosSelecionados.includes(evento.id)}
                      onCheckedChange={() => toggleEvento(evento.id)}
                    />
                    <Label
                      htmlFor={evento.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {evento.label}
                    </Label>
                  </div>
                ))}
              </div>
              {eventosSelecionados.length === 0 && (
                <p className="text-sm text-destructive">
                  Selecione pelo menos um evento
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ativo">Webhook Ativo</Label>
              <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                createWebhook.isPending ||
                updateWebhook.isPending ||
                eventosSelecionados.length === 0
              }
            >
              {webhook ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
