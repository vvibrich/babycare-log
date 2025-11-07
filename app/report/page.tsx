'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Record, Child } from '@/types/record';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileDown, FileText } from 'lucide-react';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';
import { generatePDFReport, generateCSVReport } from '@/lib/generateReport';
import { formatDateTime } from '@/utils/formatDate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Thermometer, Pill } from 'lucide-react';

export default function ReportPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [childName, setChildName] = useState('Criança');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
    
    // Load selected child from localStorage
    const savedChildId = localStorage.getItem('selectedChildId');
    if (savedChildId) {
      setSelectedChildId(savedChildId);
    }
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
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      const childrenData = data || [];
      setChildren(childrenData);

      // Auto-select from localStorage or first child
      const savedChildId = localStorage.getItem('selectedChildId');
      if (savedChildId && childrenData.find(c => c.id === savedChildId)) {
        setSelectedChildId(savedChildId);
        const child = childrenData.find(c => c.id === savedChildId);
        if (child) setChildName(child.name);
      } else if (childrenData.length > 0) {
        setSelectedChildId(childrenData[0].id);
        setChildName(childrenData[0].name);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('records')
        .select('*');

      // Filter by selected child
      if (selectedChildId) {
        query = query.eq('child_id', selectedChildId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
    const child = children.find(c => c.id === childId);
    if (child) {
      setChildName(child.name);
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
      const endDate = new Date(dateRange.to || dateRange.from!);

      // Set time to start/end of day for accurate comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return recordDate >= startDate && recordDate <= endDate;
    });

    setFilteredRecords(filtered);
  };

  const handleExportPDF = () => {
    generatePDFReport({
      records: filteredRecords,
      childName,
      startDate: dateRange?.from,
      endDate: dateRange?.to || dateRange?.from,
    });
  };

  const handleExportCSV = () => {
    generateCSVReport({
      records: filteredRecords,
      childName,
      startDate: dateRange?.from,
      endDate: dateRange?.to || dateRange?.from,
    });
  };

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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Gerar Relatório</CardTitle>
              <CardDescription>
                Selecione o período e exporte os registros em PDF ou CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Child Selector */}
              <div className="space-y-2">
                <Label htmlFor="child">Selecione a Criança *</Label>
                {children.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Nenhuma criança cadastrada. 
                      <Link href="/children/new" className="ml-1 underline font-medium">
                        Adicione uma criança
                      </Link>
                    </p>
                  </div>
                ) : (
                  <Select value={selectedChildId} onValueChange={handleChildChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma criança" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          👶 {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Período</Label>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
                {dateRange?.from && (
                  <p className="text-sm text-muted-foreground">
                    {filteredRecords.length} registro(s) encontrado(s) no período
                  </p>
                )}
              </div>

              {/* Export Buttons */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={handleExportPDF}
                  disabled={filteredRecords.length === 0}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button
                  onClick={handleExportCSV}
                  disabled={filteredRecords.length === 0}
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {filteredRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Tipo</TableHead>
                        <TableHead className="w-[180px]">Data/Hora</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Detalhes</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {record.type === 'symptom' ? (
                              <Thermometer className="h-5 w-5 text-orange-500" />
                            ) : (
                              <Pill className="h-5 w-5 text-blue-500" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatDateTime(record.created_at)}
                          </TableCell>
                          <TableCell>{record.title}</TableCell>
                          <TableCell>{record.details}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando registros...</p>
            </div>
          )}

          {!isLoading && filteredRecords.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-lg">Nenhum registro encontrado</p>
                  <p className="text-sm mt-2">
                    {dateRange?.from
                      ? 'Tente ajustar o período selecionado'
                      : 'Comece adicionando registros'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
