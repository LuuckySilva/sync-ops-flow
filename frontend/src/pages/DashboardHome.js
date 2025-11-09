import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { systemService } from '../services/api';
import { Activity, Database, FileSpreadsheet, Users } from 'lucide-react';

const DashboardHome = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const [statusRes, versionRes] = await Promise.all([
        systemService.getStatus(),
        systemService.getVersion()
      ]);
      setStatus(statusRes.data);
      setVersion(versionRes.data);
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const stats = [
    {
      title: 'Frequência',
      value: status?.collections?.frequencia || 0,
      icon: FileSpreadsheet,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Alimentação',
      value: status?.collections?.alimentacao || 0,
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Materiais',
      value: status?.collections?.materiais || 0,
      icon: FileSpreadsheet,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Usuários',
      value: status?.collections?.usuarios || 0,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Bem-vindo, {user?.nome}!</h2>
        <p className="text-gray-600 mt-1">Dashboard do Sistema Sync Ops Flow</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Banco de Dados:</span>
              <span className="font-medium">
                {status?.database === 'connected' ? '✅ Conectado' : '❌ Desconectado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Versão:</span>
              <span className="font-medium">{version?.version}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Funcionalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {version?.features?.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
