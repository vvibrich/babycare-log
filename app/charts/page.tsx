'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Record } from '@/types/record';
import { TemperatureChart } from '@/components/TemperatureChart';

export default function ChartsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Gráficos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Acompanhe a evolução da temperatura e outros indicadores
          </p>
        </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando gráficos...</p>
            </div>
          ) : (
            <>
              {/* Temperature Chart */}
              <TemperatureChart records={records} />

              {/* Future charts can be added here */}
              {/* <MedicationChart records={records} /> */}
              {/* <SymptomsFrequencyChart records={records} /> */}
            </>
          )}
      </div>
    </div>
  );
}
