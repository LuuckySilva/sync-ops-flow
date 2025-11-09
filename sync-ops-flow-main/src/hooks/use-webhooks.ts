import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Webhook {
  id: string;
  nome: string;
  url: string;
  eventos: string[];
  ativo: boolean;
  secret_key?: string;
  headers?: Record<string, string>;
  created_at: string;
  updated_at: string;
  ultimo_envio?: string;
  total_envios: number;
  total_erros: number;
}

export function useWebhooks() {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Webhook[];
    },
  });
}

export function useCreateWebhook() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (webhook: Omit<Webhook, "id" | "created_at" | "updated_at" | "ultimo_envio" | "total_envios" | "total_erros">) => {
      const { data, error } = await supabase
        .from("webhooks")
        .insert(webhook)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Webhook criado",
        description: "Webhook configurado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateWebhook() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...webhook }: Partial<Webhook> & { id: string }) => {
      const { data, error } = await supabase
        .from("webhooks")
        .update(webhook)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Webhook atualizado",
        description: "Configurações salvas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteWebhook() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Webhook removido",
        description: "Webhook deletado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
