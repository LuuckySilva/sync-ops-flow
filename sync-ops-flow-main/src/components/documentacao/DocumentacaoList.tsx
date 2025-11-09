import { useState } from "react";
import { mockDocumentos } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, Eye } from "lucide-react";

const tipoDocumentoLabels: Record<string, string> = {
  contrato: "Contrato de Trabalho",
  termo_responsabilidade: "Termo de Responsabilidade",
  acordo_compensacao: "Acordo de Compensação",
  ordem_servico: "Ordem de Serviço",
  comunicado: "Comunicado",
  termo_desligamento: "Termo de Desligamento"
};

export const DocumentacaoList = () => {
  const [documentos] = useState(mockDocumentos);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documentação</h2>
          <p className="text-sm text-muted-foreground">
            Geração e controle de documentos dos funcionários
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Gerar Documento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success/10">
              <FileText className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assinados</p>
              <p className="text-2xl font-bold">
                {documentos.filter(d => d.status === 'assinado').length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-warning/10">
              <FileText className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">
                {documentos.filter(d => d.status === 'pendente').length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{documentos.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Tipo de Documento</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Data Assinatura</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentos.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.nome}</TableCell>
                <TableCell>
                  {tipoDocumentoLabels[doc.tipo_documento] || doc.tipo_documento}
                </TableCell>
                <TableCell>
                  {new Date(doc.data_emissao).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  {doc.data_assinatura 
                    ? new Date(doc.data_assinatura).toLocaleDateString('pt-BR')
                    : <span className="text-muted-foreground">-</span>
                  }
                </TableCell>
                <TableCell>
                  <Badge variant={doc.status === 'assinado' ? 'default' : 'secondary'}>
                    {doc.status === 'assinado' ? 'Assinado' : 'Pendente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
