'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Child } from '@/types/record';
import { Button } from '@/components/ui/button';
import { ManageChildAccess } from '@/components/ManageChildAccess';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChildAccessPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchChild();
    }
  }, [childId]);

  const fetchChild = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      if (error) throw error;
      setChild(data);
    } catch (error) {
      console.error('Error fetching child:', error);
      alert('Erro ao carregar criança.');
      router.push('/children');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Link href="/children">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Gerenciar Acesso
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              👶 {child.name}
            </p>
          </div>

          {/* Manage Access Component */}
          <ManageChildAccess childId={childId} childName={child.name} />
        </div>
      </div>
    </div>
  );
}
