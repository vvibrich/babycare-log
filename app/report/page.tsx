'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Record, Child, symptomTypeLabels } from '@/types/record';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileDown, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DateRange } from 'react-day-picker';
import { generatePDFReport, generateCSVReport } from '@/lib/generateReport';
import { ShareDialog } from '@/components/ShareDialog';
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

              {/* Export and Share Buttons */}
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
                <ShareDialog
                  records={filteredRecords}
                  childName={childName}
                  startDate={dateRange?.from}
                  endDate={dateRange?.to || dateRange?.from}
                  disabled={filteredRecords.length === 0}
                />
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
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {filteredRecords.map((record) => (
                    <Card 
                      key={record.id} 
                      className="overflow-hidden border-l-4 shadow-md hover:shadow-lg transition-all duration-200"
                      style={{
                        borderLeftColor: record.type === 'symptom' ? '#f97316' : '#3b82f6'
                      }}
                    >
                      <CardContent className="p-0">
                        {/* Header with gradient */}
                        <div className={`p-4 pb-3 ${
                          record.type === 'symptom' 
                            ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20'
                        }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Icon with background */}
                              <div className={`flex-shrink-0 p-2.5 rounded-xl shadow-sm ${
                                record.type === 'symptom'
                                  ? 'bg-orange-100 dark:bg-orange-900/30'
                                  : 'bg-blue-100 dark:bg-blue-900/30'
                              }`}>
                                {record.type === 'symptom' ? (
                                  <Thermometer className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                ) : (
                                  <Pill className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>

                              {/* Title and type badge */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    record.type === 'symptom'
                                      ? 'bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
                                      : 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                  }`}>
                                    {record.type === 'symptom' ? '🌡️ Sintoma' : '💊 Medicação'}
                                  </span>
                                </div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight">
                                  {record.symptom_type && symptomTypeLabels[record.symptom_type] ? (
                                    symptomTypeLabels[record.symptom_type]
                                  ) : (
                                    record.title
                                  )}
                                </h3>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          {/* Date with icon */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">{formatDateTime(record.created_at)}</span>
                            </div>
                          </div>

                          {/* Details with icon */}
                          <div className="flex items-start gap-2">
                            <div className={`flex-shrink-0 mt-0.5 w-1 h-1 rounded-full ${
                              record.type === 'symptom' ? 'bg-orange-500' : 'bg-blue-500'
                            }`} />
                            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {record.temperature ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-bold">
                                  🌡️ {record.temperature}°C
                                </span>
                              ) : (
                                record.details
                              )}
                            </div>
                          </div>

                          {/* Notes */}
                          {record.notes && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border-l-2 border-amber-400 rounded-r-lg">
                              <div className="flex gap-2">
                                <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">📝</span>
                                <p className="text-xs text-amber-900 dark:text-amber-200 italic leading-relaxed">
                                  {record.notes}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Photo */}
                          {record.photo_url && (
                            <div className="pt-2">
                              <div className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-md border-2 border-gray-200 dark:border-gray-700">
                                <Image
                                  src={record.photo_url}
                                  alt="Foto do registro"
                                  fill
                                  className="object-cover"
                                  unoptimized
                                  onClick={() => window.open(record.photo_url!, '_blank')}
                                />
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                                  <span className="text-white text-xs font-medium">📷 Ver foto</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block rounded-md border">
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
