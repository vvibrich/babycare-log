'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Record, Child } from '@/types/record';
import { RecordList } from '@/components/RecordList';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchRecords();
    }
  }, [selectedChildId]);

  useEffect(() => {
    filterRecords();
  }, [records, dateRange]);

  const fetchChildren = async () => {
    try {
      // Verificar se há usuário autenticado antes de fazer a query
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setChildren([]);
        return;
      }

      const { data: childrenRows, error: childrenError } = await supabase
        .rpc('get_accessible_children');

      if (childrenError) throw childrenError;

      const childrenData = (childrenRows ?? []) as Child[];

      if (!childrenData.length) {
        setChildren([]);
        setSelectedChildId(null);
        localStorage.removeItem('selectedChildId');
        return;
      }

      setChildren(childrenData);
      
      // Auto-select first child or from localStorage
      const savedChildId = localStorage.getItem('selectedChildId');
      if (savedChildId && childrenData.some(c => c.id === savedChildId)) {
        setSelectedChildId(savedChildId);
      } else {
        setSelectedChildId(childrenData[0].id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchRecords = async () => {
    if (!selectedChildId) return;
    
    setIsLoading(true);
    try {
      // Verificar se há usuário autenticado antes de fazer a query
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setRecords([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('records_with_user')
        .select('*')
        .eq('child_id', selectedChildId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    if (!dateRange?.from) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter((record) => {
      const recordDate = new Date(record.created_at);
      const startDate = new Date(dateRange.from!);
      const endDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from!);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return recordDate >= startDate && recordDate <= endDate;
    });

    setFilteredRecords(filtered);
  };

  const handleClearFilter = () => {
    setDateRange(undefined);
  };

  const childName = children.find(c => c.id === selectedChildId)?.name || 'Criança';

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Histórico de Registros
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualize e filtre todos os registros de {childName}
          </p>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>
              Selecione um período para filtrar os registros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
              {dateRange?.from && (
                <Button
                  variant="outline"
                  onClick={handleClearFilter}
                  className="sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtro
                </Button>
              )}
            </div>
            
            {/* Info about filter */}
            <div className="text-sm text-muted-foreground">
              {dateRange?.from ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Exibindo {filteredRecords.length} de {records.length} registro{records.length !== 1 ? 's' : ''}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Exibindo todos os {records.length} registro{records.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando registros...</p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <RecordList records={filteredRecords} />
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nenhum registro encontrado</p>
                <p className="text-sm mt-2">
                  {dateRange?.from
                    ? 'Tente ajustar o período selecionado'
                    : 'Ainda não há registros para esta criança'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
