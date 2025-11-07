import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm', { locale: ptBR });
}
