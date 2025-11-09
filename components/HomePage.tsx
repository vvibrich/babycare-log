'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Record, Child } from '@/types/record';
import { RecordList } from '@/components/RecordList';
import { TemperatureChart } from '@/components/TemperatureChart';
import { ChildSelector } from '@/components/ChildSelector';
import { MedicationReminders } from '@/components/MedicationReminders';
import { InsightsPanel } from '@/components/InsightsPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { PendingInvites } from '@/components/PendingInvites';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function HomePage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const childrenData = data || [];
      setChildren(childrenData);
      
      // Auto-select first active child if none selected
      if (!selectedChildId && childrenData.length > 0) {
        const firstActive = childrenData.find(c => c.is_active);
        if (firstActive) {
          setSelectedChildId(firstActive.id);
          localStorage.setItem('selectedChildId', firstActive.id);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchRecords = async (showRefreshing = false, childId: string | null = selectedChildId) => {
    if (showRefreshing) setIsRefreshing(true);
    
    try {
      let query = supabase
        .from('records_with_user')
        .select('*');

      // Filter by child if selected
      if (childId) {
        query = query.eq('child_id', childId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRecords(true);
  };

  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
    localStorage.setItem('selectedChildId', childId);
    fetchRecords(false, childId);
  };

  useEffect(() => {
    // Load selected child from localStorage
    const savedChildId = localStorage.getItem('selectedChildId');
    if (savedChildId) {
      setSelectedChildId(savedChildId);
    }

    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId !== null || children.length > 0) {
      fetchRecords();
    }

    // Subscribe to changes in the records table
    const recordsChannel = supabase
      .channel('records-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'records',
        },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    // Subscribe to children changes
    const childrenChannel = supabase
      .channel('children-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'children',
        },
        () => {
          fetchChildren();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(recordsChannel);
      supabase.removeChannel(childrenChannel);
    };
  }, [selectedChildId, children.length]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Início
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Acompanhe os cuidados com seu bebê
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <UserMenu />
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Atualizar"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

          {/* Child Selector */}
          <ChildSelector
            children={children}
            selectedChildId={selectedChildId}
            onChildChange={handleChildChange}
          />

          {/* Pending Invites */}
          <PendingInvites />

          {/* Action Buttons */}
          {selectedChildId && (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/add/symptom" className="w-full">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  <Plus className="mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Sintoma</span>
                </Button>
              </Link>
              <Link href="/add/medication" className="w-full">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  <Plus className="mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Medicação</span>
                </Button>
              </Link>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando registros...</p>
            </div>
          ) : (
            <>
              {/* Medication Reminders */}
              {selectedChildId && <MedicationReminders childId={selectedChildId} />}

              {/* Insights Panel - AI Analysis */}
              {selectedChildId && (
                <InsightsPanel 
                  records={records} 
                  child={children.find(c => c.id === selectedChildId)}
                />
              )}

              {/* Records List */}
              <RecordList records={records} />

            </>
          )}
      </div>
    </div>
  );
}
