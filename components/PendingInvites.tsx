'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Check, X, Clock } from 'lucide-react';

interface PendingInvite {
  id: string;
  child_id: string;
  child_name: string;
  inviter_email: string;
  role: string;
  message?: string;
  created_at: string;
  expires_at: string;
}

export function PendingInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchInvites();
    }
  }, [user]);

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      // Buscar convites pendentes para o email do usuário
      const { data, error } = await supabase
        .from('child_invites')
        .select(`
          id,
          child_id,
          role,
          message,
          created_at,
          expires_at,
          children (
            name
          )
        `)
        .eq('invitee_email', user?.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formatar dados
      const formattedInvites = data?.map((invite: any) => ({
        id: invite.id,
        child_id: invite.child_id,
        child_name: invite.children?.name || 'Criança',
        inviter_email: '',
        role: invite.role,
        message: invite.message,
        created_at: invite.created_at,
        expires_at: invite.expires_at,
      })) || [];

      setInvites(formattedInvites);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      // Chamar função SQL para aceitar convite
      const { data, error } = await supabase.rpc('accept_child_invite', {
        invite_id: inviteId,
      });

      if (error) throw error;

      if (data) {
        alert('✅ Convite aceito! Você agora tem acesso aos dados da criança.');
        fetchInvites();
        // Recarregar página para atualizar lista de crianças
        window.location.reload();
      } else {
        alert('❌ Não foi possível aceitar o convite. Ele pode ter expirado.');
      }
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      alert('❌ Erro ao aceitar convite. Tente novamente.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (inviteId: string) => {
    if (!confirm('Tem certeza que deseja recusar este convite?')) {
      return;
    }

    setProcessingId(inviteId);
    try {
      // Chamar função SQL para rejeitar convite
      const { data, error } = await supabase.rpc('reject_child_invite', {
        invite_id: inviteId,
      });

      if (error) throw error;

      alert('Convite recusado.');
      fetchInvites();
    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      alert('❌ Erro ao recusar convite. Tente novamente.');
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return null;
  }

  if (invites.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Convites Pendentes
          <Badge variant="secondary" className="ml-2">
            {invites.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Você foi convidado para acessar dados de crianças
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="p-4 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">👶 {invite.child_name}</h4>
                    <Badge className={getRoleColor(invite.role)}>
                      {getRoleLabel(invite.role)}
                    </Badge>
                  </div>

                  {invite.message && (
                    <p className="text-sm text-muted-foreground italic">
                      "{invite.message}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Expira em {getDaysRemaining(invite.expires_at)} dia(s)
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(invite.id)}
                    disabled={processingId === invite.id}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(invite.id)}
                    disabled={processingId === invite.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Recusar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
