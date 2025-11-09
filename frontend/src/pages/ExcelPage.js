import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { excelService } from '../services/api';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';

const ExcelPage = () => {
  const [activeModule, setActiveModule] = useState('frequencia');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');

  const modules = {
    frequencia: {
      name: 'Frequência',
      import: excelService.importFrequencia,
      export: excelService.exportFrequencia
    },
    alimentacao: {
      name: 'Alimentação',
      import: excelService.importAlimentacao,
      export: excelService.exportAlimentacao
    },
    materiais: {
      name: 'Materiais',
      import: excelService.importMateriais,
      export: excelService.exportMateriais
    }
  };

  const handleImport = async (e, moduleKey) => {
    e.preventDefault();
    const file = e.target.elements.file.files[0];
    
    if (!file) {
      setError('Selecione um arquivo');
      return;
    }

    setImporting(true);
    setError('');
    setImportResult(null);

    try {
      const response = await modules[moduleKey].import(file);
      setImportResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao importar arquivo');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (moduleKey, dataInicio, dataFim) => {
    setExporting(true);
    setError('');

    try {
      const response = await modules[moduleKey].export(dataInicio, dataFim);
      
      // Cria link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${moduleKey}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao exportar dados');
    } finally {
      setExporting(false);
    }
  };

  const ModuleCard = ({ moduleKey, moduleName }) => (
    <div className="space-y-6">
      {/* Importação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Importar {moduleName}
          </CardTitle>
          <CardDescription>
            Faça upload de arquivo Excel (.xlsx) ou CSV para importar dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleImport(e, moduleKey)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`file-${moduleKey}`}>Arquivo</Label>
              <Input
                id={`file-${moduleKey}`}
                name="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                disabled={importing}
              />
              <p className="text-sm text-gray-500">
                Formatos aceitos: .xlsx, .xls, .csv
              </p>
            </div>
            
            <Button type="submit" disabled={importing}>
              {importing ? 'Importando...' : 'Importar Arquivo'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Exportar {moduleName}
          </CardTitle>
          <CardDescription>
            Exporte os dados em formato Excel (.xlsx)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`data-inicio-${moduleKey}`}>Data Inicial (opcional)</Label>
                <Input
                  id={`data-inicio-${moduleKey}`}
                  type="date"
                  disabled={exporting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`data-fim-${moduleKey}`}>Data Final (opcional)</Label>
                <Input
                  id={`data-fim-${moduleKey}`}
                  type="date"
                  disabled={exporting}
                />
              </div>
            </div>
            
            <Button
              onClick={() => {
                const dataInicio = document.getElementById(`data-inicio-${moduleKey}`).value;
                const dataFim = document.getElementById(`data-fim-${moduleKey}`).value;
                handleExport(moduleKey, dataInicio, dataFim);
              }}
              disabled={exporting}
            >
              {exporting ? 'Exportando...' : 'Exportar Dados'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Importação/Exportação Excel/CSV</h2>
        <p className="text-gray-600 mt-1">Gerencie dados através de planilhas</p>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {importResult && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{importResult.message}</strong>
            <div className="mt-2 text-sm">
              <p>Total processados: {importResult.total_processados}</p>
              <p>Criados: {importResult.criados}</p>
              <p>Erros: {importResult.erros}</p>
              {importResult.erros > 0 && importResult.detalhes_erros?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600">Ver erros</summary>
                  <ul className="mt-2 space-y-1">
                    {importResult.detalhes_erros.map((err, idx) => (
                      <li key={idx} className="text-xs">
                        Linha {err.linha}: {err.erro}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs para módulos */}
      <Tabs defaultValue="frequencia" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="frequencia">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Frequência
          </TabsTrigger>
          <TabsTrigger value="alimentacao">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Alimentação
          </TabsTrigger>
          <TabsTrigger value="materiais">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Materiais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frequencia">
          <ModuleCard moduleKey="frequencia" moduleName="Frequência" />
        </TabsContent>

        <TabsContent value="alimentacao">
          <ModuleCard moduleKey="alimentacao" moduleName="Alimentação" />
        </TabsContent>

        <TabsContent value="materiais">
          <ModuleCard moduleKey="materiais" moduleName="Materiais" />
        </TabsContent>
      </Tabs>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-gray-900">Frequência:</h4>
            <p>Colunas obrigatórias: funcionario_id, data</p>
            <p>Colunas opcionais: hora_entrada, hora_saida, tipo_dia, observacao</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900">Alimentação:</h4>
            <p>Colunas obrigatórias: funcionario_id, data, tipo_refeicao</p>
            <p>Colunas opcionais: nome, valor_unitario, quantidade, fornecedor</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900">Materiais:</h4>
            <p>Colunas obrigatórias: data, descricao, local_uso</p>
            <p>Colunas opcionais: categoria, quantidade, valor_unitario, autorizado_por</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelPage;
