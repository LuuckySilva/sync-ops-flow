-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'operacional');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Policies for user_roles
CREATE POLICY "Usuários podem ver suas próprias roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem inserir roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem atualizar roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem deletar roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create funcionarios table
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  cargo TEXT NOT NULL,
  setor TEXT NOT NULL,
  data_admissao DATE NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Funcionarios são visíveis para usuários autenticados"
  ON public.funcionarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Administradores podem inserir funcionários"
  ON public.funcionarios
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Administradores podem atualizar funcionários"
  ON public.funcionarios
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Administradores podem deletar funcionários"
  ON public.funcionarios
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_funcionarios_updated_at
  BEFORE UPDATE ON public.funcionarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for search performance
CREATE INDEX IF NOT EXISTS idx_funcionarios_nome ON public.funcionarios USING gin(to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_funcionarios_cpf ON public.funcionarios(cpf);
CREATE INDEX IF NOT EXISTS idx_funcionarios_setor ON public.funcionarios(setor);