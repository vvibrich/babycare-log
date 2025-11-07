'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Record } from '@/types/record';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Clock } from 'lucide-react';
import { formatDateTime } from '@/utils/formatDate';
import { useRouter } from 'next/navigation';

interface MedicationRemindersProps {
  childId: string | null;
}

export function MedicationReminders({ childId }: MedicationRemindersProps) {
  const router = useRouter();
  const [reminders, setReminders] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchReminders();

      // Refresh every minute
      const interval = setInterval(fetchReminders, 60000);
      return () => clearInterval(interval);
    }
  }, [childId]);

  const fetchReminders = async () => {
    if (!childId) return;

    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('type', 'medication')
        .eq('reminder_enabled', true)
        .eq('child_id', childId)
        .lte('next_dose_at', now)
        .order('next_dose_at', { ascending: true });

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsDone = async (reminder: Record) => {
    try {
      // Create new record with same medication
      const selectedChildId = localStorage.getItem('selectedChildId');
      
      const { error } = await supabase.from('records').insert([
        {
          type: 'medication',
          title: reminder.title,
          details: reminder.details,
          notes: `Dose aplicada via lembrete`,
          child_id: selectedChildId || null,
          reminder_enabled: reminder.reminder_enabled,
          reminder_interval_hours: reminder.reminder_interval_hours,
        },
      ]);

      if (error) throw error;

      // Refresh reminders
      fetchReminders();
      router.refresh();
    } catch (error) {
      console.error('Error marking reminder as done:', error);
      alert('Erro ao registrar dose. Por favor, tente novamente.');
    }
  };

  if (isLoading) {
    return null;
  }

  if (reminders.length === 0) {
    return null;
  }

  const getTimeStatus = (nextDoseAt: string) => {
    const now = new Date();
    const doseTime = new Date(nextDoseAt);
    const diffMinutes = Math.floor((now.getTime() - doseTime.getTime()) / 60000);

    if (diffMinutes < 30) {
      return { text: 'Agora!', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' };
    } else if (diffMinutes < 60) {
      return { text: `Há ${diffMinutes} min`, color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' };
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return { text: `Há ${diffHours}h`, color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' };
    }
  };

  return (
    <Card className="border-2 border-orange-300 bg-orange-50/50 dark:bg-orange-950/30 dark:border-orange-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl text-orange-700 dark:text-orange-400">
          <Bell className="h-5 w-5 animate-pulse" />
          Lembretes de Medicação
        </CardTitle>
        <CardDescription>
          {reminders.length} {reminders.length === 1 ? 'dose pendente' : 'doses pendentes'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.map((reminder) => {
          const timeStatus = getTimeStatus(reminder.next_dose_at!);
          
          return (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border-2 ${timeStatus.bgColor} transition-all hover:shadow-md`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">💊</span>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{reminder.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{reminder.details}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3" />
                    <span className="text-muted-foreground">
                      Última dose: {formatDateTime(reminder.created_at)}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium mt-2 ${timeStatus.color}`}>
                    <Bell className="h-4 w-4" />
                    <span>{timeStatus.text}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleMarkAsDone(reminder)}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aplicada
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
