'use client';

import { useState } from 'react';
import { Record, symptomTypeLabels } from '@/types/record';
import { formatDateTime } from '@/utils/formatDate';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Thermometer, Trash2, Edit, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EditRecordModal } from './EditRecordModal';

interface RecordListProps {
  records: Record[];
}

export function RecordList({ records }: RecordListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('records').delete().eq('id', id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Erro ao excluir registro. Por favor, tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg">Nenhum registro encontrado</p>
            <p className="text-sm mt-2">
              Comece adicionando um sintoma ou medicação
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Registros</CardTitle>
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
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
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
                  <TableCell>
                    {record.symptom_type && symptomTypeLabels[record.symptom_type] ? (
                      <div>
                        <div className="font-medium">{symptomTypeLabels[record.symptom_type]}</div>
                        {record.title !== symptomTypeLabels[record.symptom_type].replace(/^[^\s]+\s/, '') && (
                          <div className="text-sm text-muted-foreground">{record.title}</div>
                        )}
                      </div>
                    ) : (
                      record.title
                    )}
                  </TableCell>
                  <TableCell>
                    {record.temperature ? `${record.temperature}°C` : record.details}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.notes || '-'}
                  </TableCell>
                  <TableCell>
                    {record.photo_url ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        <Image
                          src={record.photo_url}
                          alt="Foto do registro"
                          fill
                          className="object-cover"
                          unoptimized
                          onClick={() => window.open(record.photo_url!, '_blank')}
                        />
                      </div>
                    ) : (
                      <ImageIcon className="h-5 w-5 text-gray-300" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Modal */}
      <EditRecordModal
        record={editingRecord}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </Card>
  );
}
