import { supabase } from '@/lib/supabaseClient';
import { Record } from '@/types/record';
import { TemperatureChart } from '@/components/TemperatureChart';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getRecords(): Promise<Record[]> {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching records:', error);
    return [];
  }

  return data || [];
}

export default async function ChartsPage() {
  const records = await getRecords();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              📊 Gráficos e Estatísticas
            </h1>
            <p className="text-gray-600 mt-2">
              Acompanhe a evolução da temperatura e outros indicadores
            </p>
          </div>

          {/* Temperature Chart */}
          <TemperatureChart records={records} />

          {/* Future charts can be added here */}
          {/* <MedicationChart records={records} /> */}
          {/* <SymptomsFrequencyChart records={records} /> */}
        </div>
      </div>
    </div>
  );
}
