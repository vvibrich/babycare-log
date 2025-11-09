'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { IncidentSeverity } from '@/types/record';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface CreateIncidentDialogProps {
  childId: string;
  onIncidentCreated: () => void;
}

export function CreateIncidentDialog({ childId, onIncidentCreated }: CreateIncidentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'low' as IncidentSeverity,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Por favor, insira um título para o incidente');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('incidents').insert({
        child_id: childId,
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        severity: formData.severity,
        status: 'active',
      });

      if (error) throw error;

      // Reset form and close dialog
      setFormData({ title: '', description: '', severity: 'low' });
      setOpen(false);
      onIncidentCreated();
    } catch (error) {
      console.error('Error creating incident:', error);
      alert('Erro ao criar incidente. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-dashed border-2 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="text-xs sm:text-sm font-semibold">Novo Incidente</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Incidente</DialogTitle>
          <DialogDescription>
            Agrupe sintomas e medicações relacionados a um evento específico (ex: queda, infecção)
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Incidente *</Label>
            <Input
              id="title"
              placeholder="Ex: Queda na escola, Infecção respiratória"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o que aconteceu..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severidade</Label>
            <Select
              value={formData.severity}
              onValueChange={(value: IncidentSeverity) =>
                setFormData({ ...formData, severity: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Baixa</SelectItem>
                <SelectItem value="medium">🟡 Média</SelectItem>
                <SelectItem value="high">🔴 Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Incidente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
