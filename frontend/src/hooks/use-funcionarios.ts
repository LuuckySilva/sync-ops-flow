import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Funcionario } from '@/types';
import { toast } from 'sonner';

export function useFuncionarios(params?: { ativo?: boolean; setor?: string }) {
  return useQuery<Funcionario[]>({
    queryKey: ['funcionarios', params],
    queryFn: () => api.funcionarios.getAll(params),
  });
}

export function useFuncionario(id: string) {
  return useQuery<Funcionario>({
    queryKey: ['funcionarios', id],
    queryFn: () => api.funcionarios.getById(id),
    enabled: !!id,
  });
}

export function useCreateFuncionario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.funcionarios.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      toast.success('Funcionário criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.detail || 'Erro ao criar funcionário');
    },
  });
}

export function useUpdateFuncionario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.funcionarios.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      toast.success('Funcionário atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.detail || 'Erro ao atualizar funcionário');
    },
  });
}

export function useDeleteFuncionario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.funcionarios.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      toast.success('Funcionário desativado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.detail || 'Erro ao desativar funcionário');
    },
  });
}
