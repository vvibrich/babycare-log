-- ============================================
-- COMPARTILHAMENTO DE CRIANÇAS
-- ============================================
-- Permite múltiplos responsáveis para mesma criança
-- Sistema de convites com aceitação
-- ============================================

-- Tabela de relacionamento many-to-many
CREATE TABLE IF NOT EXISTS child_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(child_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS child_access_child_id_idx ON child_access(child_id);
CREATE INDEX IF NOT EXISTS child_access_user_id_idx ON child_access(user_id);

-- Tabela de convites
CREATE TABLE IF NOT EXISTS child_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- Índices
CREATE INDEX IF NOT EXISTS child_invites_invitee_email_idx ON child_invites(invitee_email);
CREATE INDEX IF NOT EXISTS child_invites_invitee_id_idx ON child_invites(invitee_id);
CREATE INDEX IF NOT EXISTS child_invites_status_idx ON child_invites(status);
CREATE INDEX IF NOT EXISTS child_invites_child_id_idx ON child_invites(child_id);

-- ============================================
-- POPULAR child_access COM DADOS EXISTENTES
-- ============================================
-- Adicionar owners atuais (user_id em children)
INSERT INTO child_access (child_id, user_id, role, granted_by)
SELECT 
  id as child_id,
  user_id,
  'owner' as role,
  user_id as granted_by
FROM children
WHERE user_id IS NOT NULL
ON CONFLICT (child_id, user_id) DO NOTHING;

-- ============================================
-- RLS POLICIES PARA child_access
-- ============================================

ALTER TABLE child_access ENABLE ROW LEVEL SECURITY;

-- Ver acessos de crianças que você tem acesso
CREATE POLICY "Users can view access for their children"
  ON child_access FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM child_access ca
      WHERE ca.child_id = child_access.child_id
      AND ca.user_id = auth.uid()
    )
  );

-- Owner pode adicionar novos acessos
CREATE POLICY "Owners can grant access"
  ON child_access FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM child_access
      WHERE child_id = child_access.child_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Owner pode remover acessos (exceto o próprio)
CREATE POLICY "Owners can revoke access"
  ON child_access FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM child_access ca
      WHERE ca.child_id = child_access.child_id
      AND ca.user_id = auth.uid()
      AND ca.role = 'owner'
    )
    AND child_access.user_id != auth.uid()
  );

-- Owner pode atualizar roles
CREATE POLICY "Owners can update roles"
  ON child_access FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM child_access ca
      WHERE ca.child_id = child_access.child_id
      AND ca.user_id = auth.uid()
      AND ca.role = 'owner'
    )
  );

-- ============================================
-- RLS POLICIES PARA child_invites
-- ============================================

ALTER TABLE child_invites ENABLE ROW LEVEL SECURITY;

-- Ver convites que você enviou
CREATE POLICY "Users can view invites they sent"
  ON child_invites FOR SELECT
  USING (inviter_id = auth.uid());

-- Ver convites para seu email
CREATE POLICY "Users can view invites for their email"
  ON child_invites FOR SELECT
  USING (
    invitee_email = auth.email()
    OR invitee_id = auth.uid()
  );

-- Owner pode criar convites
CREATE POLICY "Owners can create invites"
  ON child_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM child_access
      WHERE child_id = child_invites.child_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Quem enviou pode cancelar
CREATE POLICY "Inviters can cancel invites"
  ON child_invites FOR UPDATE
  USING (inviter_id = auth.uid());

-- Destinatário pode aceitar/rejeitar
CREATE POLICY "Invitees can respond to invites"
  ON child_invites FOR UPDATE
  USING (
    invitee_email = auth.email()
    OR invitee_id = auth.uid()
  );

-- ============================================
-- ATUALIZAR RLS POLICIES DE children
-- ============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can view their own children" ON children;
DROP POLICY IF EXISTS "Users can insert their own children" ON children;
DROP POLICY IF EXISTS "Users can update their own children" ON children;
DROP POLICY IF EXISTS "Users can delete their own children" ON children;

-- Ver crianças que você tem acesso (via child_access)
CREATE POLICY "Users can view children they have access to"
  ON children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = children.id
      AND child_access.user_id = auth.uid()
    )
  );

-- Criar criança (você se torna owner automaticamente)
CREATE POLICY "Users can create children"
  ON children FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owner e Editor podem atualizar
CREATE POLICY "Owners and editors can update children"
  ON children FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = children.id
      AND child_access.user_id = auth.uid()
      AND child_access.role IN ('owner', 'editor')
    )
  );

-- Apenas owner pode deletar
CREATE POLICY "Only owners can delete children"
  ON children FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = children.id
      AND child_access.user_id = auth.uid()
      AND child_access.role = 'owner'
    )
  );

-- ============================================
-- ATUALIZAR RLS POLICIES DE records
-- ============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can view their own records" ON records;
DROP POLICY IF EXISTS "Users can insert their own records" ON records;
DROP POLICY IF EXISTS "Users can update their own records" ON records;
DROP POLICY IF EXISTS "Users can delete their own records" ON records;

-- Ver registros de crianças que você tem acesso
CREATE POLICY "Users can view records of accessible children"
  ON records FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = records.child_id
      AND child_access.user_id = auth.uid()
    )
  );

-- Criar registros (owner, editor ou próprios sem criança)
CREATE POLICY "Users can create records"
  ON records FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      child_id IS NULL
      OR EXISTS (
        SELECT 1 FROM child_access
        WHERE child_access.child_id = records.child_id
        AND child_access.user_id = auth.uid()
        AND child_access.role IN ('owner', 'editor')
      )
    )
  );

-- Atualizar próprios registros OU se for owner/editor da criança
CREATE POLICY "Users can update their records or if owner/editor"
  ON records FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = records.child_id
      AND child_access.user_id = auth.uid()
      AND child_access.role IN ('owner', 'editor')
    )
  );

-- Deletar próprios registros OU se for owner/editor da criança
CREATE POLICY "Users can delete their records or if owner/editor"
  ON records FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = records.child_id
      AND child_access.user_id = auth.uid()
      AND child_access.role IN ('owner', 'editor')
    )
  );

-- ============================================
-- FUNÇÃO: Aceitar convite
-- ============================================

CREATE OR REPLACE FUNCTION accept_child_invite(invite_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite RECORD;
BEGIN
  -- Buscar convite
  SELECT * INTO v_invite
  FROM child_invites
  WHERE id = invite_id
  AND (invitee_email = auth.email() OR invitee_id = auth.uid())
  AND status = 'pending'
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Criar acesso
  INSERT INTO child_access (child_id, user_id, role, granted_by)
  VALUES (v_invite.child_id, auth.uid(), v_invite.role, v_invite.inviter_id)
  ON CONFLICT (child_id, user_id) DO NOTHING;

  -- Atualizar convite
  UPDATE child_invites
  SET 
    status = 'accepted',
    invitee_id = auth.uid(),
    updated_at = NOW()
  WHERE id = invite_id;

  RETURN TRUE;
END;
$$;

-- ============================================
-- FUNÇÃO: Rejeitar convite
-- ============================================

CREATE OR REPLACE FUNCTION reject_child_invite(invite_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE child_invites
  SET 
    status = 'rejected',
    invitee_id = auth.uid(),
    updated_at = NOW()
  WHERE id = invite_id
  AND (invitee_email = auth.email() OR invitee_id = auth.uid())
  AND status = 'pending';

  RETURN FOUND;
END;
$$;
