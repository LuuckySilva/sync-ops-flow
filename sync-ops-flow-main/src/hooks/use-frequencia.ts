import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { RegistroFrequencia } from '@/types';
import { toast } from 'sonner';

export function useFrequencia(params?: {
  data_inicio?: string;
  data_fim?: string;
  funcionario_id?: string;
}) {
  return useQuery<RegistroFrequencia[]>({
    queryKey: ['frequencia', params],
    queryFn: () => api.frequencia.getAll(params),
  });
}

export function useFrequenciaById(id: string) {
  return useQuery<RegistroFrequencia>({
    queryKey: ['frequencia', id],
    queryFn: () => api.frequencia.getById(id),
    enabled: !!id,
  });
}

export function useFrequenciaByFuncionarioMes(
  funcionario_id: string,
  ano: number,
  mes: number
) {
  return useQuery<RegistroFrequencia[]>({
    queryKey: ['frequencia', 'mes', funcionario_id, ano, mes],
    queryFn: () => api.frequencia.getByFuncionarioMes(funcionario_id, ano, mes),
    enabled: !!funcionario_id && !!ano && !!mes,
  });
}

export function useCreateFrequencia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.frequencia.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequencia'] });
      toast.success('Frequência registrada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.detail || 'Erro ao registrar frequência');
    },
  });
}

export function useUpdateFrequencia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.frequencia.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequencia'] });
      toast.success('Frequência atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.detail || 'Erro ao atualizar frequência');
    },
  });
}

export function useDeleteFrequencia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.frequencia.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequencia'] });
      toast.success('Frequência removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.detail || 'Erro ao remover frequência');
    },
  });
}
