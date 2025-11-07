import { Record, symptomTypeLabels } from '@/types/record';
import { formatDateTime } from '@/utils/formatDate';

interface ShareReportOptions {
  records: Record[];
  childName: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Gera texto formatado do relatório para compartilhamento
 */
export function generateReportText(options: ShareReportOptions): string {
  const { records, childName, startDate, endDate } = options;

  let text = `📊 *Relatório BabyCare Log*\n\n`;
  text += `👶 *Criança:* ${childName}\n`;

  if (startDate && endDate) {
    const start = startDate.toLocaleDateString('pt-BR');
    const end = endDate.toLocaleDateString('pt-BR');
    text += `📅 *Período:* ${start} a ${end}\n`;
  } else if (startDate) {
    text += `📅 *Data:* ${startDate.toLocaleDateString('pt-BR')}\n`;
  }

  text += `📝 *Total de registros:* ${records.length}\n\n`;

  // Agrupar por tipo
  const symptoms = records.filter(r => r.type === 'symptom');
  const medications = records.filter(r => r.type === 'medication');

  if (symptoms.length > 0) {
    text += `🌡️ *Sintomas* (${symptoms.length})\n`;
    text += `${'─'.repeat(30)}\n`;
    symptoms.forEach((record, index) => {
      const date = formatDateTime(record.created_at);
      const title = record.symptom_type 
        ? symptomTypeLabels[record.symptom_type] 
        : record.title;
      const details = record.temperature 
        ? `${record.temperature}°C` 
        : record.details;
      
      text += `${index + 1}. ${date}\n`;
      text += `   ${title}\n`;
      text += `   ${details}\n`;
      if (record.notes) {
        text += `   💬 ${record.notes}\n`;
      }
      text += `\n`;
    });
  }

  if (medications.length > 0) {
    text += `💊 *Medicações* (${medications.length})\n`;
    text += `${'─'.repeat(30)}\n`;
    medications.forEach((record, index) => {
      const date = formatDateTime(record.created_at);
      
      text += `${index + 1}. ${date}\n`;
      text += `   ${record.title}\n`;
      text += `   ${record.details}\n`;
      if (record.notes) {
        text += `   💬 ${record.notes}\n`;
      }
      text += `\n`;
    });
  }

  text += `\n_Gerado pelo BabyCare Log_`;

  return text;
}

/**
 * Compartilha relatório via WhatsApp
 */
export function shareViaWhatsApp(options: ShareReportOptions) {
  const text = generateReportText(options);
  const encodedText = encodeURIComponent(text);
  
  // WhatsApp Web URL
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  
  window.open(whatsappUrl, '_blank');
}

/**
 * Compartilha relatório via Email
 */
export function shareViaEmail(options: ShareReportOptions) {
  const { childName, startDate, endDate } = options;
  const text = generateReportText(options);
  
  let subject = `Relatório BabyCare - ${childName}`;
  if (startDate && endDate) {
    const start = startDate.toLocaleDateString('pt-BR');
    const end = endDate.toLocaleDateString('pt-BR');
    subject += ` (${start} a ${end})`;
  }
  
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(text);
  
  // Mailto URL
  const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
  
  window.location.href = mailtoUrl;
}

/**
 * Copia texto do relatório para área de transferência
 */
export async function copyReportToClipboard(options: ShareReportOptions): Promise<boolean> {
  const text = generateReportText(options);
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para área de transferência:', error);
    return false;
  }
}

/**
 * Gera resumo estatístico do relatório
 */
export function generateReportSummary(records: Record[]): string {
  const symptoms = records.filter(r => r.type === 'symptom');
  const medications = records.filter(r => r.type === 'medication');
  
  const fevers = symptoms.filter(r => r.symptom_type === 'febre');
  const avgTemp = fevers.length > 0
    ? fevers.reduce((sum, r) => sum + (r.temperature || 0), 0) / fevers.length
    : 0;
  
  let summary = `📊 *Resumo*\n\n`;
  summary += `Total: ${records.length} registros\n`;
  summary += `Sintomas: ${symptoms.length}\n`;
  summary += `Medicações: ${medications.length}\n`;
  
  if (fevers.length > 0) {
    summary += `\n🌡️ Febres: ${fevers.length}\n`;
    summary += `Temperatura média: ${avgTemp.toFixed(1)}°C\n`;
  }
  
  return summary;
}
