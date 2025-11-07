'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { RecordType, SymptomType, symptomTypeLabels } from '@/types/record';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { ArrowLeft, Save, Bell } from 'lucide-react';

interface RecordFormProps {
  type: RecordType;
}

export function RecordForm({ type }: RecordFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    notes: '',
    symptom_type: '' as SymptomType | '',
    temperature: '',
    reminder_enabled: false,
    reminder_interval_hours: '',
    photo_url: '' as string | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get selected child from localStorage
      const selectedChildId = localStorage.getItem('selectedChildId');

      const insertData: any = {
        type,
        title: formData.title,
        details: formData.details,
        notes: formData.notes || null,
        child_id: selectedChildId || null,
        photo_url: formData.photo_url || null,
        user_id: user?.id,
      };

      // Add reminder fields for medications
      if (type === 'medication' && formData.reminder_enabled && formData.reminder_interval_hours) {
        insertData.reminder_enabled = true;
        insertData.reminder_interval_hours = parseInt(formData.reminder_interval_hours);
      }

      // Add symptom-specific fields
      if (type === 'symptom' && formData.symptom_type) {
        insertData.symptom_type = formData.symptom_type;
        
        // Auto-fill title based on symptom type
        insertData.title = symptomTypeLabels[formData.symptom_type].replace(/^[^\s]+\s/, '');
        
        // Add temperature if fever symptom
        if (formData.symptom_type === 'febre' && formData.temperature) {
          insertData.temperature = parseFloat(formData.temperature);
          insertData.details = `${formData.temperature}°C`;
        } else {
          // For other symptoms, use notes as details or a generic text
          insertData.details = formData.notes || insertData.title;
        }
      }

      const { error } = await supabase.from('records').insert([insertData]);

      if (error) throw error;

      // Small delay to ensure data is persisted before redirect
      await new Promise(resolve => setTimeout(resolve, 300));
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Erro ao salvar registro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formConfig = {
    symptom: {
      title: 'Registrar Sintoma',
      description: 'Adicione informações sobre o sintoma observado',
      titleLabel: 'Nome do Sintoma',
      titlePlaceholder: 'Ex: Febre',
      detailsLabel: 'Detalhes',
      detailsPlaceholder: 'Ex: Temperatura 38.7°C',
      icon: '🤒',
    },
    medication: {
      title: 'Registrar Medicação',
      description: 'Adicione informações sobre a medicação administrada',
      titleLabel: 'Nome do Medicamento',
      titlePlaceholder: 'Ex: Paracetamol',
      detailsLabel: 'Dose',
      detailsPlaceholder: 'Ex: 10 gotas',
      icon: '💊',
    },
  };

  const config = formConfig[type];

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <span>{config.icon}</span>
            {config.title}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symptom Type Selection (only for symptoms) */}
            {type === 'symptom' && (
              <div className="space-y-2">
                <Label htmlFor="symptom_type">Tipo de Sintoma</Label>
                <Select
                  value={formData.symptom_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, symptom_type: value as SymptomType })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de sintoma" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(symptomTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Temperature Field (only for fever) */}
            {type === 'symptom' && formData.symptom_type === 'febre' && (
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura (°C) *</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="35"
                  max="42"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: e.target.value })
                  }
                  placeholder="Ex: 38.5"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Digite a temperatura medida (entre 35°C e 42°C)
                </p>
              </div>
            )}

            {/* Title and Details - Only for medications */}
            {type === 'medication' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">{config.titleLabel}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder={config.titlePlaceholder}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">{config.detailsLabel}</Label>
                  <Input
                    id="details"
                    value={formData.details}
                    onChange={(e) =>
                      setFormData({ ...formData, details: e.target.value })
                    }
                    placeholder={config.detailsPlaceholder}
                    required
                  />
                </div>
              </>
            )}

            {/* Reminder fields - Only for medications */}
            {type === 'medication' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder_enabled"
                    checked={formData.reminder_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, reminder_enabled: checked as boolean })
                    }
                  />
                  <Label htmlFor="reminder_enabled" className="flex items-center gap-2 cursor-pointer">
                    <Bell className="h-4 w-4" />
                    Ativar lembrete para próxima dose
                  </Label>
                </div>

                {formData.reminder_enabled && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="reminder_interval_hours">Intervalo entre doses (horas) *</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="reminder_interval_hours"
                        type="number"
                        min="1"
                        max="24"
                        value={formData.reminder_interval_hours}
                        onChange={(e) =>
                          setFormData({ ...formData, reminder_interval_hours: e.target.value })
                        }
                        placeholder="Ex: 6"
                        required={formData.reminder_enabled}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">horas</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Ex: 6 horas (de 6 em 6 horas), 8 horas (de 8 em 8 horas), etc.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
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

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Salvando...' : 'Salvar Registro'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
