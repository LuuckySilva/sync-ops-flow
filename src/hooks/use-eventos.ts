import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FuncionarioEvento {
  id: string;
  funcionario_id: string;
  tipo_evento: "admissao" | "demissao" | "atualizacao" | "reativacao";
  dados_anteriores?: any;
  dados_novos?: any;
  usuario_id?: string;
  created_at: string;
  descricao?: string;
  funcionarios?: {
    nome: string;
    cpf: string;
  };
}

export function useEventos(funcionarioId?: string) {
  return useQuery({
    queryKey: ["funcionario-eventos", funcionarioId],
    queryFn: async () => {
      let query = supabase
        .from("funcionario_eventos")
        .select("*, funcionarios(nome, cpf)")
        .order("created_at", { ascending: false });

      if (funcionarioId) {
        query = query.eq("funcionario_id", funcionarioId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FuncionarioEvento[];
    },
  });
}

export function useProcessarWebhook() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventoId: string) => {
      const { data, error } = await supabase.functions.invoke(
        "process-webhook-event",
        {
          body: { evento_id: eventoId },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Webhooks processados",
        description: "Notificações enviadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar webhooks",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
