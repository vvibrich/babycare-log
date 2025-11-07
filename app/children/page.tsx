'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Child } from '@/types/record';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Edit, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/formatDate';

export default function ChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChildren(data || []);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
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
              <h1 className="text-3xl font-bold text-gray-800">Gerenciar Crianças</h1>
              <p className="text-gray-600 mt-2">
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
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
          ) : children.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-lg">Nenhuma criança cadastrada</p>
                  <p className="text-sm mt-2">Comece adicionando uma criança</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {children.map((child) => (
                <Card key={child.id} className={!child.is_active ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          👶 {child.name}
                          {!child.is_active && (
                            <span className="text-xs font-normal text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                              Inativo
                            </span>
                          )}
                        </CardTitle>
                        {child.birth_date && (
                          <CardDescription className="mt-2">
                            Nascimento: {formatDate(child.birth_date)}
                          </CardDescription>
                        )}
                        {child.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{child.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/children/${child.id}/access`)}
                          title="Gerenciar Acesso"
                        >
                          <Users className="h-4 w-4 text-purple-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/children/edit/${child.id}`)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(child.id, child.is_active)}
                          title={child.is_active ? 'Desativar' : 'Ativar'}
                        >
                          <span className="text-sm">
                            {child.is_active ? '🔵' : '⚪'}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(child.id)}
                          disabled={deletingId === child.id}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
