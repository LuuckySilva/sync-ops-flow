import { EventosTable } from "@/components/eventos/EventosTable";
import { WebhooksTable } from "@/components/webhooks/WebhooksTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Webhook } from "lucide-react";

export default function Eventos() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sistema de Eventos e Webhooks</h2>
        <p className="text-sm text-muted-foreground">
          Monitore mudanças e configure notificações automáticas
        </p>
      </div>

      <Tabs defaultValue="eventos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="eventos" className="gap-2">
            <Activity className="w-4 h-4" />
            Histórico de Eventos
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventos">
          <EventosTable />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
