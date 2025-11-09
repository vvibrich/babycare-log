'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Child, ChildSex, BloodType } from '@/types/record';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, User, Activity, Stethoscope } from 'lucide-react';
import Link from 'next/link';

export default function EditChildPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    notes: '',
    sex: '' as ChildSex | '',
    weight_kg: '',
    height_cm: '',
    blood_type: '' as BloodType | '',
    allergies: '',
    medical_conditions: '',
    ongoing_medications: '',
    doctor_name: '',
    doctor_phone: '',
    insurance_number: '',
  });

  useEffect(() => {
    fetchChild();
  }, [childId]);

  const fetchChild = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          birth_date: data.birth_date || '',
          notes: data.notes || '',
          sex: data.sex || '',
          weight_kg: data.weight_kg?.toString() || '',
          height_cm: data.height_cm?.toString() || '',
          blood_type: data.blood_type || '',
          allergies: data.allergies || '',
          medical_conditions: data.medical_conditions || '',
          ongoing_medications: data.ongoing_medications || '',
          doctor_name: data.doctor_name || '',
          doctor_phone: data.doctor_phone || '',
          insurance_number: data.insurance_number || '',
        });
      }
    } catch (error) {
      console.error('Error fetching child:', error);
      alert('Erro ao carregar dados da criança.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const birthDate = formData.birth_date 
        ? formData.birth_date
        : null;

      const now = new Date().toISOString();
      
      // Fetch current data to check if weight/height changed
      const { data: currentData } = await supabase
        .from('children')
        .select('weight_kg, height_cm')
        .eq('id', childId)
        .single();

      const updateData: any = {
        name: formData.name,
        birth_date: birthDate,
        notes: formData.notes || null,
        sex: formData.sex || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        blood_type: formData.blood_type || null,
        allergies: formData.allergies || null,
        medical_conditions: formData.medical_conditions || null,
        ongoing_medications: formData.ongoing_medications || null,
        doctor_name: formData.doctor_name || null,
        doctor_phone: formData.doctor_phone || null,
        insurance_number: formData.insurance_number || null,
      };

      // Update timestamps only if values changed
      const newWeight = formData.weight_kg ? parseFloat(formData.weight_kg) : null;
      const newHeight = formData.height_cm ? parseFloat(formData.height_cm) : null;
      
      if (newWeight !== currentData?.weight_kg) {
        updateData.last_weight_update = now;
      }
      
      if (newHeight !== currentData?.height_cm) {
        updateData.last_height_update = now;
      }

      const { error } = await supabase
        .from('children')
        .update(updateData)
        .eq('id', childId);

      if (error) throw error;

      router.push('/children');
      router.refresh();
    } catch (error) {
      console.error('Error updating child:', error);
      alert('Erro ao atualizar criança. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Link href="/children">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">✏️ Editar Criança</CardTitle>
            <CardDescription>
              Atualize as informações da criança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                  <User className="h-5 w-5" />
                  Dados Pessoais
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: Maria"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sex">Sexo</Label>
                    <Select
                      value={formData.sex}
                      onValueChange={(value) =>
                        setFormData({ ...formData, sex: value as ChildSex })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) =>
                        setFormData({ ...formData, birth_date: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Medidas Físicas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                  <Activity className="h-5 w-5" />
                  Medidas Físicas
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Peso (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight_kg}
                      onChange={(e) =>
                        setFormData({ ...formData, weight_kg: e.target.value })
                      }
                      placeholder="Ex: 12.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height_cm">Altura (cm)</Label>
                    <Input
                      id="height_cm"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.height_cm}
                      onChange={(e) =>
                        setFormData({ ...formData, height_cm: e.target.value })
                      }
                      placeholder="Ex: 85.5"
                    />
                  </div>
                </div>
              </div>

              {/* Informações Médicas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                  <Stethoscope className="h-5 w-5" />
                  Informações Médicas
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blood_type">Tipo Sanguíneo</Label>
                    <Select
                      value={formData.blood_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, blood_type: value as BloodType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="unknown">Desconhecido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Alergias</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) =>
                        setFormData({ ...formData, allergies: e.target.value })
                      }
                      placeholder="Ex: Dipirona, amendoim, poeira..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medical_conditions">Condições Médicas</Label>
                    <Textarea
                      id="medical_conditions"
                      value={formData.medical_conditions}
                      onChange={(e) =>
                        setFormData({ ...formData, medical_conditions: e.target.value })
                      }
                      placeholder="Ex: Asma, diabetes..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ongoing_medications">Medicações Contínuas</Label>
                    <Textarea
                      id="ongoing_medications"
                      value={formData.ongoing_medications}
                      onChange={(e) =>
                        setFormData({ ...formData, ongoing_medications: e.target.value })
                      }
                      placeholder="Ex: Vitamina D 400UI diária..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor_name">Médico/Pediatra</Label>
                      <Input
                        id="doctor_name"
                        value={formData.doctor_name}
                        onChange={(e) =>
                          setFormData({ ...formData, doctor_name: e.target.value })
                        }
                        placeholder="Dr. João Silva"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor_phone">Telefone do Médico</Label>
                      <Input
                        id="doctor_phone"
                        type="tel"
                        value={formData.doctor_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, doctor_phone: e.target.value })
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurance_number">Número do Plano de Saúde</Label>
                    <Input
                      id="insurance_number"
                      value={formData.insurance_number}
                      onChange={(e) =>
                        setFormData({ ...formData, insurance_number: e.target.value })
                      }
                      placeholder="Ex: 123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Observações Gerais */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Gerais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Outras informações relevantes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/children')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
