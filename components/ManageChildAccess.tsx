'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InviteUserDialog } from './InviteUserDialog';
import { Users, Crown, Edit, Eye, X, Clock, Mail } from 'lucide-react';

interface ChildAccess {
  id: string;
  child_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  granted_by: string | null;
  granted_at: string;
  created_at: string;
  user_email?: string | null;
  user_full_name?: string | null;
  user_display_name?: string | null;
}

interface ChildInvite {
  id: string;
  invitee_email: string;
  role: string;
  status: string;
  created_at: string;
  message?: string;
  invitee_full_name?: string | null;
  invitee_email_confirmed?: string | null;
  invitee_display_name?: string | null;
}

interface ManageChildAccessProps {
  childId: string;
  childName: string;
}

export function ManageChildAccess({ childId, childName }: ManageChildAccessProps) {
  const { user } = useAuth();
  const [accesses, setAccesses] = useState<ChildAccess[]>([]);
  const [invites, setInvites] = useState<ChildInvite[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [childId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscar acessos
      const { data: accessData, error: accessError } = await supabase
        .from('child_access_with_details')
        .select('*')
        .eq('child_id', childId)
        .order('role', { ascending: true })
        .order('granted_at', { ascending: true });

      if (accessError) throw accessError;

      // Verificar se usuário atual é owner
      const myAccess = accessData?.find((a) => a.user_id === user?.id);
      setIsOwner(myAccess?.role === 'owner');

      setAccesses(accessData || []);

      // Buscar convites pendentes (se for owner)
      if (myAccess?.role === 'owner') {
        const { data: inviteData, error: inviteError } = await supabase
          .from('child_invites_with_details')
          .select('*')
          .eq('child_id', childId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (inviteError) throw inviteError;
        setInvites(inviteData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar acessos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayName = (access: ChildAccess) => {
    if (access.user_id === user?.id) {
      return 'Você';
    }

    if (access.user_display_name) {
      return access.user_display_name;
    }

    if (access.user_full_name) {
      return access.user_full_name;
    }

    if (access.user_email) {
      return access.user_email;
    }

    return `Usuário ${access.user_id.slice(0, 8)}...`;
  };

  const handleRevokeAccess = async (accessId: string, userLabel?: string) => {
    if (!confirm(`Tem certeza que deseja remover o acesso de ${userLabel || 'este usuário'}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('child_access')
        .delete()
        .eq('id', accessId);

      if (error) throw error;

      alert('✅ Acesso removido com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Erro ao remover acesso:', error);
      alert('❌ Erro ao remover acesso.');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('child_invites')
        .update({ status: 'cancelled' })
        .eq('id', inviteId);

      if (error) throw error;

      alert('✅ Convite cancelado!');
      fetchData();
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      alert('❌ Erro ao cancelar convite.');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'editor':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Proprietário';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Acessos Atuais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Responsáveis
              </CardTitle>
              <CardDescription>
                Pessoas com acesso aos dados de {childName}
              </CardDescription>
            </div>
            {isOwner && (
              <InviteUserDialog
                childId={childId}
                childName={childName}
                onInviteSent={fetchData}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {accesses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum responsável ainda
            </p>
          ) : (
            <div className="space-y-2">
              {accesses.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getRoleIcon(access.role)}
                    <div>
                      <p className="font-medium text-sm">
                        {formatDisplayName(access)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRoleLabel(access.role)}
                      </p>
                    </div>
                  </div>
                  {isOwner && access.user_id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeAccess(access.id, formatDisplayName(access))}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convites Pendentes */}
      {isOwner && invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Convites Pendentes
            </CardTitle>
            <CardDescription>
              Aguardando aceitação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {invite.invitee_display_name || invite.invitee_email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRoleLabel(invite.role)} • {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelInvite(invite.id)}
                    title="Cancelar convite"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
