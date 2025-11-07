'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';

interface InviteUserDialogProps {
  childId: string;
  childName: string;
  onInviteSent?: () => void;
}

export function InviteUserDialog({ childId, childName, onInviteSent }: InviteUserDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer' as 'viewer' | 'editor',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar email
      if (!formData.email || !formData.email.includes('@')) {
        alert('Por favor, insira um email válido.');
        return;
      }

      // Verificar se não está convidando a si mesmo
      if (formData.email.toLowerCase() === user?.email?.toLowerCase()) {
        alert('Você não pode convidar a si mesmo.');
        return;
      }

      // Verificar se já existe convite pendente
      const { data: existingInvite } = await supabase
        .from('child_invites')
        .select('id')
        .eq('child_id', childId)
        .eq('invitee_email', formData.email.toLowerCase())
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        alert('Já existe um convite pendente para este email.');
        return;
      }

      // Criar convite (se usuário já tiver acesso, será ignorado na aceitação)
      const { error } = await supabase.from('child_invites').insert([
        {
          child_id: childId,
          inviter_id: user?.id,
          invitee_email: formData.email.toLowerCase(),
          role: formData.role,
          message: formData.message || null,
        },
      ]);

      if (error) throw error;

      alert(`✅ Convite enviado para ${formData.email}!`);
      setFormData({ email: '', role: 'viewer', message: '' });
      setOpen(false);
      
      if (onInviteSent) {
        onInviteSent();
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      alert('Erro ao enviar convite. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Responsável</DialogTitle>
          <DialogDescription>
            Convide alguém para acessar os dados de {childName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              O convidado receberá acesso após fazer login com este email
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Nível de Acesso *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'viewer' | 'editor') => 
                setFormData({ ...formData, role: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  👁️ Visualizador - Apenas ver dados
                </SelectItem>
                <SelectItem value="editor">
                  ✏️ Editor - Ver e adicionar registros
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Ex: Olá! Gostaria de compartilhar os dados do(a) João com você."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Convite'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
