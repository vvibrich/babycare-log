'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Record, SymptomType, symptomTypeLabels } from '@/types/record';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ImageUpload';
import { Save, X } from 'lucide-react';

interface EditRecordModalProps {
  record: Record | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRecordModal({
  record,
  open,
  onOpenChange,
}: EditRecordModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    notes: '',
    symptom_type: '' as SymptomType | '',
    temperature: '',
    photo_url: null as string | null,
  });

  useEffect(() => {
    if (record) {
      setFormData({
        title: record.title,
        details: record.details,
        notes: record.notes || '',
        symptom_type: record.symptom_type || '',
        temperature: record.temperature?.toString() || '',
        photo_url: record.photo_url || null,
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    setIsLoading(true);

    try {
      const updateData: any = {
        title: formData.title,
        details: formData.details,
        notes: formData.notes || null,
        photo_url: formData.photo_url || null,
      };

      // Add symptom-specific fields if it's a symptom
      if (record.type === 'symptom') {
        updateData.symptom_type = formData.symptom_type || null;
        updateData.temperature = formData.temperature ? parseFloat(formData.temperature) : null;
      }

      const { error } = await supabase
        .from('records')
        .update(updateData)
        .eq('id', record.id);

      if (error) throw error;

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Erro ao atualizar registro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!record) return null;

  const formConfig = {
    symptom: {
      title: 'Editar Sintoma',
      description: 'Altere as informações do sintoma',
      titleLabel: 'Nome do Sintoma',
      titlePlaceholder: 'Ex: Febre',
      detailsLabel: 'Detalhes',
      detailsPlaceholder: 'Ex: Temperatura 38.7°C',
      icon: '🤒',
    },
    medication: {
      title: 'Editar Medicação',
      description: 'Altere as informações da medicação',
      titleLabel: 'Nome do Medicamento',
      titlePlaceholder: 'Ex: Paracetamol',
      detailsLabel: 'Dose',
      detailsPlaceholder: 'Ex: 10 gotas',
      icon: '💊',
    },
  };

  const config = formConfig[record.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{config.icon}</span>
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Symptom Type (only for symptoms) */}
          {record.type === 'symptom' && (
            <div className="space-y-2">
              <Label htmlFor="edit-symptom-type">Tipo de Sintoma</Label>
              <Select
                value={formData.symptom_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, symptom_type: value as SymptomType })
                }
              >
                <SelectTrigger id="edit-symptom-type">
                  <SelectValue placeholder="Selecione o tipo de sintoma" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(symptomTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Temperature (only for symptoms) */}
          {record.type === 'symptom' && (
            <div className="space-y-2">
              <Label htmlFor="edit-temperature">Temperatura (°C)</Label>
              <Input
                id="edit-temperature"
                type="number"
                step="0.1"
                min="35"
                max="42"
                value={formData.temperature}
                onChange={(e) =>
                  setFormData({ ...formData, temperature: e.target.value })
                }
                placeholder="Ex: 38.5"
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Insira apenas se for febre ou tiver medido temperatura.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-title">{config.titleLabel}</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={config.titlePlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-details">{config.detailsLabel}</Label>
            <Input
              id="edit-details"
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              placeholder={config.detailsPlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Observações (opcional)</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Adicione observações adicionais..."
              rows={4}
            />
          </div>

          <ImageUpload
            onImageUploaded={(url) => setFormData({ ...formData, photo_url: url })}
            currentImageUrl={formData.photo_url}
            onImageRemoved={() => setFormData({ ...formData, photo_url: null })}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
