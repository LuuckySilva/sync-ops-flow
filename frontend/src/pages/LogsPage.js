import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { logService } from '../services/api';
import { ScrollText, Filter, TrendingUp } from 'lucide-react';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tipo: '',
    status: '',
    limite: 50
  });

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await logService.getRecentLogs(filters.limite);
      setLogs(response.data);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await logService.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.tipo) filterParams.tipo = filters.tipo;
      if (filters.status) filterParams.status = filters.status;
      filterParams.limite = filters.limite;

      const response = await logService.filterLogs(filterParams);
      setLogs(response.data);
    } catch (err) {
      console.error('Erro ao filtrar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'sucesso' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getTipoColor = (tipo) => {
    const colors = {
      login: 'text-blue-600 bg-blue-50',
      import: 'text-purple-600 bg-purple-50',
      export: 'text-orange-600 bg-orange-50',
      create: 'text-green-600 bg-green-50',
      update: 'text-yellow-600 bg-yellow-50',
      delete: 'text-red-600 bg-red-50'
    };
    return colors[tipo] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Logs de Auditoria</h2>
        <p className="text-gray-600 mt-1">Histórico de ações no sistema</p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Logs</p>
                  <p className="text-2xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Por Tipo</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(stats.por_tipo || {}).map(([tipo, count]) => (
                    <div key={tipo} className="flex justify-between">
                      <span className="capitalize">{tipo}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Por Status</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(stats.por_status || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="capitalize">{status}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filters.tipo} onValueChange={(value) => setFilters({...filters, tipo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="import">Importação</SelectItem>
                  <SelectItem value="export">Exportação</SelectItem>
                  <SelectItem value="create">Criação</SelectItem>
                  <SelectItem value="update">Atualização</SelectItem>
                  <SelectItem value="delete">Exclusão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="sucesso">Sucesso</SelectItem>
                  <SelectItem value="erro">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Limite</Label>
              <Input
                type="number"
                value={filters.limite}
                onChange={(e) => setFilters({...filters, limite: parseInt(e.target.value)})}
                min={10}
                max={500}
              />
            </div>
          </div>
          
          <Button onClick={handleFilter} className="mt-4">
            Aplicar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Lista de logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ScrollText className="mr-2 h-5 w-5" />
            Registros ({logs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTipoColor(log.tipo)}`}>
                        {log.tipo}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                      {log.modulo && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {log.modulo}
                        </span>
                      )}
                    </div>
                    
                    <p className="font-medium text-gray-900">{log.acao}</p>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Usuário: <span className="font-medium">{log.usuario_nome}</span> ({log.usuario_email})</p>
                      <p>Data: {new Date(log.data_hora).toLocaleString('pt-BR')}</p>
                      {log.ip_origem && <p>IP: {log.ip_origem}</p>}
                    </div>
                    
                    {log.detalhes && Object.keys(log.detalhes).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer">Ver detalhes</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(log.detalhes, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsPage;
