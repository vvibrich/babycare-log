import jsPDF from 'jspdf';
import { Record } from '@/types/record';
import { formatDateTime } from '@/utils/formatDate';

interface ReportOptions {
  records: Record[];
  childName?: string;
  startDate?: Date;
  endDate?: Date;
}

export function generatePDFReport(options: ReportOptions): void {
  const { records, childName = 'Criança', startDate, endDate } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BabyCare Log - Relatório', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Criança: ${childName}`, 14, 35);
  
  if (startDate && endDate) {
    doc.text(
      `Período: ${startDate.toLocaleDateString('pt-BR')} até ${endDate.toLocaleDateString('pt-BR')}`,
      14,
      42
    );
  }
  
  // Table Header
  let yPosition = 55;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  const headers = ['Data/Hora', 'Tipo', 'Título', 'Detalhes', 'Observações'];
  const columnWidths = [35, 25, 40, 50, 45];
  let xPosition = 14;
  
  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += columnWidths[index];
  });
  
  doc.line(14, yPosition + 2, pageWidth - 14, yPosition + 2);
  
  // Table Content
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  records.forEach((record) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    xPosition = 14;
    
    // Date/Time
    const dateText = formatDateTime(record.created_at);
    doc.text(dateText, xPosition, yPosition, { maxWidth: columnWidths[0] - 2 });
    xPosition += columnWidths[0];
    
    // Type
    const typeText = record.type === 'symptom' ? 'Sintoma' : 'Medicação';
    doc.text(typeText, xPosition, yPosition, { maxWidth: columnWidths[1] - 2 });
    xPosition += columnWidths[1];
    
    // Title
    doc.text(record.title, xPosition, yPosition, { maxWidth: columnWidths[2] - 2 });
    xPosition += columnWidths[2];
    
    // Details
    doc.text(record.details, xPosition, yPosition, { maxWidth: columnWidths[3] - 2 });
    xPosition += columnWidths[3];
    
    // Notes
    if (record.notes) {
      doc.text(record.notes, xPosition, yPosition, { maxWidth: columnWidths[4] - 2 });
    }
    
    yPosition += 8;
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const fileName = `babycare-log-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export function generateCSVReport(options: ReportOptions): void {
  const { records, childName = 'Criança', startDate, endDate } = options;
  
  let csv = 'Data/Hora,Tipo,Título,Detalhes,Observações\n';
  
  records.forEach((record) => {
    const row = [
      formatDateTime(record.created_at),
      record.type === 'symptom' ? 'Sintoma' : 'Medicação',
      record.title,
      record.details,
      record.notes || ''
    ];
    
    // Escape fields that contain commas or quotes
    const escapedRow = row.map(field => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    });
    
    csv += escapedRow.join(',') + '\n';
  });
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `babycare-log-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
