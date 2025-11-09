import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookEvent {
  tipo_evento: string;
  funcionario: any;
  dados_anteriores?: any;
  timestamp: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { evento_id } = await req.json();

    // Buscar evento
    const { data: evento, error: eventoError } = await supabase
      .from("funcionario_eventos")
      .select("*, funcionarios(*)")
      .eq("id", evento_id)
      .single();

    if (eventoError || !evento) {
      throw new Error("Evento não encontrado");
    }

    // Buscar webhooks ativos que se inscreveram neste tipo de evento
    const { data: webhooks, error: webhooksError } = await supabase
      .from("webhooks")
      .select("*")
      .eq("ativo", true)
      .contains("eventos", [evento.tipo_evento]);

    if (webhooksError) {
      throw new Error("Erro ao buscar webhooks");
    }

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum webhook configurado para este evento" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Preparar payload
    const payload: WebhookEvent = {
      tipo_evento: evento.tipo_evento,
      funcionario: evento.dados_novos,
      dados_anteriores: evento.dados_anteriores,
      timestamp: evento.created_at,
    };

    // Enviar para cada webhook
    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...webhook.headers,
          };

          if (webhook.secret_key) {
            headers["X-Webhook-Secret"] = webhook.secret_key;
          }

          const response = await fetch(webhook.url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          });

          // Atualizar estatísticas do webhook
          await supabase
            .from("webhooks")
            .update({
              ultimo_envio: new Date().toISOString(),
              total_envios: webhook.total_envios + 1,
              total_erros: response.ok ? webhook.total_erros : webhook.total_erros + 1,
            })
            .eq("id", webhook.id);

          return {
            webhook_id: webhook.id,
            status: response.status,
            success: response.ok,
          };
        } catch (error) {
          // Atualizar contador de erros
          await supabase
            .from("webhooks")
            .update({
              ultimo_envio: new Date().toISOString(),
              total_erros: webhook.total_erros + 1,
            })
            .eq("id", webhook.id);

          throw error;
        }
      })
    );

    return new Response(
      JSON.stringify({
        message: "Webhooks processados",
        results: results.map((r) =>
          r.status === "fulfilled" ? r.value : { error: r.reason.message }
        ),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
