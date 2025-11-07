import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatDate(date: string | Date): string {
  // Handle date-only strings (YYYY-MM-DD) without timezone conversion
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // For date-only format (YYYY-MM-DD), parse without timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    return format(localDate, 'dd/MM/yyyy', { locale: ptBR });
  }
  
  // For datetime strings or Date objects, use parseISO or Date constructor
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm', { locale: ptBR });
}
