-- Criar tabela de logs de eventos de funcionários
CREATE TABLE IF NOT EXISTS public.funcionario_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('admissao', 'demissao', 'atualizacao', 'reativacao')),
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  descricao TEXT
);

-- Criar índices para melhor performance
CREATE INDEX idx_funcionario_eventos_funcionario_id ON public.funcionario_eventos(funcionario_id);
CREATE INDEX idx_funcionario_eventos_tipo ON public.funcionario_eventos(tipo_evento);
CREATE INDEX idx_funcionario_eventos_created_at ON public.funcionario_eventos(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.funcionario_eventos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para eventos
CREATE POLICY "Eventos são visíveis para usuários autenticados"
  ON public.funcionario_eventos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema pode inserir eventos"
  ON public.funcionario_eventos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Criar tabela de webhooks configurados
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  eventos TEXT[] NOT NULL CHECK (array_length(eventos, 1) > 0),
  ativo BOOLEAN NOT NULL DEFAULT true,
  secret_key TEXT,
  headers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ultimo_envio TIMESTAMP WITH TIME ZONE,
  total_envios INTEGER DEFAULT 0,
  total_erros INTEGER DEFAULT 0
);

-- Criar índice
CREATE INDEX idx_webhooks_ativo ON public.webhooks(ativo);

-- Habilitar RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para webhooks
CREATE POLICY "Webhooks visíveis para admins"
  ON public.webhooks
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem criar webhooks"
  ON public.webhooks
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar webhooks"
  ON public.webhooks
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar webhooks"
  ON public.webhooks
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at em webhooks
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para registrar eventos de funcionários
CREATE OR REPLACE FUNCTION public.registrar_evento_funcionario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo_evento TEXT;
  v_descricao TEXT;
BEGIN
  -- Determinar tipo de evento
  IF (TG_OP = 'INSERT') THEN
    v_tipo_evento := 'admissao';
    v_descricao := 'Funcionário admitido: ' || NEW.nome;
    
    INSERT INTO public.funcionario_eventos (
      funcionario_id,
      tipo_evento,
      dados_novos,
      usuario_id,
      descricao
    ) VALUES (
      NEW.id,
      v_tipo_evento,
      to_jsonb(NEW),
      auth.uid(),
      v_descricao
    );
    
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Verificar se foi reativação
    IF (OLD.ativo = false AND NEW.ativo = true) THEN
      v_tipo_evento := 'reativacao';
      v_descricao := 'Funcionário reativado: ' || NEW.nome;
    -- Verificar se foi demissão
    ELSIF (OLD.ativo = true AND NEW.ativo = false) THEN
      v_tipo_evento := 'demissao';
      v_descricao := 'Funcionário desligado: ' || NEW.nome;
    ELSE
      v_tipo_evento := 'atualizacao';
      v_descricao := 'Dados atualizados: ' || NEW.nome;
    END IF;
    
    INSERT INTO public.funcionario_eventos (
      funcionario_id,
      tipo_evento,
      dados_anteriores,
      dados_novos,
      usuario_id,
      descricao
    ) VALUES (
      NEW.id,
      v_tipo_evento,
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid(),
      v_descricao
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para capturar eventos
DROP TRIGGER IF EXISTS trigger_registrar_evento_funcionario ON public.funcionarios;
CREATE TRIGGER trigger_registrar_evento_funcionario
  AFTER INSERT OR UPDATE ON public.funcionarios
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_evento_funcionario();