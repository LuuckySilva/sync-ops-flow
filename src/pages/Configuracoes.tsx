import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Clock, Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Configuracoes() {
  const [cargos, setCargos] = useState([
    { id: 1, nome: "Gerente", tempoAlmoco: 60 },
    { id: 2, nome: "Desenvolvedor", tempoAlmoco: 60 },
    { id: 3, nome: "Analista", tempoAlmoco: 60 },
  ]);
  const [novoCargo, setNovoCargo] = useState("");
  const [tempoAlmocoDefault, setTempoAlmocoDefault] = useState(60);
  const [permitirHorasNegativas, setPermitirHorasNegativas] = useState(false);

  const adicionarCargo = () => {
    if (!novoCargo.trim()) {
      toast.error("Digite um nome para o cargo");
      return;
    }
    const novo = {
      id: Math.max(...cargos.map(c => c.id)) + 1,
      nome: novoCargo,
      tempoAlmoco: tempoAlmocoDefault
    };
    setCargos([...cargos, novo]);
    setNovoCargo("");
    toast.success(`Cargo "${novoCargo}" adicionado com sucesso!`);
  };

  const removerCargo = (id: number) => {
    setCargos(cargos.filter(c => c.id !== id));
    toast.success("Cargo removido com sucesso!");
  };

  const atualizarTempoAlmoco = (id: number, tempo: number) => {
    setCargos(cargos.map(c => c.id === id ? { ...c, tempoAlmoco: tempo } : c));
  };

  const salvarConfiguracoes = () => {
    toast.success("Configurações salvas com sucesso!");
    console.log({
      cargos,
      tempoAlmocoDefault,
      permitirHorasNegativas
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
        <p className="text-sm text-muted-foreground">
          Configure parâmetros e personalize o sistema
        </p>
      </div>

      {/* Gestão de Cargos */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Gestão de Cargos</CardTitle>
              <p className="text-sm text-muted-foreground">Adicione, edite ou remova cargos</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de cargos */}
          <div className="space-y-2">
            {cargos.map((cargo) => (
              <div key={cargo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{cargo.nome}</p>
                  <p className="text-sm text-muted-foreground">Almoço: {cargo.tempoAlmoco} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={cargo.tempoAlmoco}
                    onChange={(e) => atualizarTempoAlmoco(cargo.id, parseInt(e.target.value))}
                    className="w-20"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removerCargo(cargo.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Adicionar novo cargo */}
          <div className="flex gap-2">
            <Input
              placeholder="Nome do novo cargo"
              value={novoCargo}
              onChange={(e) => setNovoCargo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && adicionarCargo()}
            />
            <Button onClick={adicionarCargo}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Horário */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-50">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Configurações de Horário</CardTitle>
              <p className="text-sm text-muted-foreground">Defina padrões de tempo</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tempo de Almoço Padrão (minutos)</Label>
            <Input
              type="number"
              value={tempoAlmocoDefault}
              onChange={(e) => setTempoAlmocoDefault(parseInt(e.target.value))}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tempo aplicado a novos cargos cadastrados
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Permitir Horas Negativas</p>
              <p className="text-sm text-muted-foreground">
                Permite lançamento de banco de horas negativo
              </p>
            </div>
            <Button
              variant={permitirHorasNegativas ? "default" : "outline"}
              onClick={() => setPermitirHorasNegativas(!permitirHorasNegativas)}
            >
              {permitirHorasNegativas ? "Ativado" : "Desativado"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Salvar Configurações */}
      <div className="flex justify-end">
        <Button onClick={salvarConfiguracoes} size="lg" className="gap-2">
          <Settings className="w-4 h-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
