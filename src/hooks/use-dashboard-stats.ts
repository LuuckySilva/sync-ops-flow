import { useQuery } from '@tanstack/react-query';
import { useFuncionarios } from './use-funcionarios';
import { useFrequencia } from './use-frequencia';

export function useDashboardStats() {
  // Buscar funcionários ativos
  const { data: funcionarios = [] } = useFuncionarios({ ativo: true });
  
  // Buscar frequência do mês atual
  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const dataInicio = firstDay.toISOString().split('T')[0];
  const dataFim = lastDay.toISOString().split('T')[0];
  
  const { data: frequenciasMes = [] } = useFrequencia({
    data_inicio: dataInicio,
    data_fim: dataFim,
  });

  // Calcular estatísticas
  const stats = {
    totalFuncionarios: funcionarios.length,
    funcionariosAtivos: funcionarios.filter(f => f.ativo).length,
    presencasRegistradas: frequenciasMes.length,
    horasTrabalhadasMes: frequenciasMes.reduce((sum, reg) => sum + (reg.total_horas || 0), 0),
    mediaHorasDia: frequenciasMes.length > 0
      ? (frequenciasMes.reduce((sum, reg) => sum + (reg.total_horas || 0), 0) / frequenciasMes.length).toFixed(1)
      : '0',
  };

  return { stats, isLoading: false };
}
