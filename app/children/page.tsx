'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Child } from '@/types/record';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Edit, Trash2, Users, Baby, Calendar, Heart, Droplet, Scale, Ruler, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/formatDate';

type ChildAccessRole = 'owner' | 'editor' | 'viewer';
type ChildWithAccess = Child & { access_role: ChildAccessRole };

export default function ChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildWithAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const { data: childrenRows, error: childrenError } = await supabase
        .rpc('get_accessible_children');

      if (childrenError) throw childrenError;

      const childrenData = (childrenRows ?? []) as ChildWithAccess[];
      setChildren(childrenData);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta criança? Todos os registros associados também serão excluídos.')) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase.from('children').delete().eq('id', id);

      if (error) throw error;

      fetchChildren();
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Erro ao excluir criança. Por favor, tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('children')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      fetchChildren();
    } catch (error) {
      console.error('Error updating child status:', error);
      alert('Erro ao atualizar status. Por favor, tente novamente.');
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age === 0) {
      const months = monthDiff < 0 ? 12 + monthDiff : monthDiff;
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
    
    return `${age} ${age === 1 ? 'ano' : 'anos'}`;
  };

  const getSexIcon = (sex: string | null | undefined) => {
    switch(sex) {
      case 'male': return '👦';
      case 'female': return '👧';
      default: return '👶';
    }
  };

  const getSexLabel = (sex: string | null | undefined) => {
    switch(sex) {
      case 'male': return 'Masculino';
      case 'female': return 'Feminino';
      case 'other': return 'Outro';
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-4xl pb-24">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gerenciar Crianças</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Adicione e gerencie as crianças do sistema
              </p>
            </div>
            <Link href="/children/new">
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Nova Criança
              </Button>
            </Link>
          </div>

          {/* Children List */}
          {isLoading ? (
            <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
          ) : children.length === 0 ? (
            <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-lg">Nenhuma criança cadastrada</p>
                  <p className="text-sm mt-2">Comece adicionando uma criança</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {children.map((child) => {
                const isOwner = child.access_role === 'owner';
                return (
                <Card key={child.id} className={`relative overflow-hidden border-l-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200 ${
                  !child.is_active 
                    ? 'opacity-60 border-l-gray-400' 
                    : child.sex === 'male' 
                      ? 'border-l-blue-500' 
                      : child.sex === 'female' 
                        ? 'border-l-pink-500' 
                        : 'border-l-purple-500'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getSexIcon(child.sex)}</span>
                          <CardTitle className="text-xl">
                            {child.name}
                          </CardTitle>
                          {!child.is_active && (
                            <span className="text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                              Inativo
                            </span>
                          )}
                        </div>
                        
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {child.birth_date && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span className="text-muted-foreground">
                                {calculateAge(child.birth_date)} • {formatDate(child.birth_date)}
                              </span>
                            </div>
                          )}
                          
                          {getSexLabel(child.sex) && (
                            <div className="flex items-center gap-2 text-sm">
                              <Baby className="h-4 w-4 text-purple-500" />
                              <span className="text-muted-foreground">{getSexLabel(child.sex)}</span>
                            </div>
                          )}
                          
                          {child.weight_kg && (
                            <div className="flex items-center gap-2 text-sm">
                              <Scale className="h-4 w-4 text-green-500" />
                              <span className="text-muted-foreground">{child.weight_kg} kg</span>
                            </div>
                          )}
                          
                          {child.height_cm && (
                            <div className="flex items-center gap-2 text-sm">
                              <Ruler className="h-4 w-4 text-orange-500" />
                              <span className="text-muted-foreground">{child.height_cm} cm</span>
                            </div>
                          )}
                          
                          {child.blood_type && child.blood_type !== 'unknown' && (
                            <div className="flex items-center gap-2 text-sm">
                              <Droplet className="h-4 w-4 text-red-500" />
                              <span className="text-muted-foreground">Tipo {child.blood_type}</span>
                            </div>
                          )}
                          
                          {child.allergies && (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              <span className="text-muted-foreground truncate">Alergias</span>
                            </div>
                          )}
                          
                          {child.medical_conditions && (
                            <div className="flex items-center gap-2 text-sm">
                              <Heart className="h-4 w-4 text-pink-500" />
                              <span className="text-muted-foreground truncate">Condições médicas</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1 ml-4">
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/children/${child.id}/access`)}
                            title="Gerenciar Acesso"
                            className="h-8 w-8 p-0"
                          >
                            <Users className="h-4 w-4 text-purple-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/children/${child.id}/edit`)}
                          title={isOwner ? 'Editar' : 'Visualizar'}
                          className="h-8 w-8 p-0"
                          disabled={!isOwner}
                        >
                          <Edit className={`h-4 w-4 ${isOwner ? 'text-blue-500' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(child.id, child.is_active)}
                          title={child.is_active ? 'Desativar' : 'Ativar'}
                          className="h-8 w-8 p-0"
                          disabled={!isOwner}
                        >
                          <span className="text-sm">
                            {child.is_active ? '🔵' : '⚪'}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(child.id)}
                          disabled={deletingId === child.id || !isOwner}
                          title="Excluir"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className={`h-4 w-4 ${isOwner ? 'text-red-500' : 'text-muted-foreground'}`} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
