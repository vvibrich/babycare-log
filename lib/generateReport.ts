import jsPDF from "jspdf";
import { Record, formatTemperature, Incident, Child } from "@/types/record";
import { formatDateTime } from "@/utils/formatDate";

export type ReportType =
  | "all"
  | "medical"
  | "symptoms"
  | "medications"
  | "incident";

interface ReportOptions {
  records: Record[];
  childName?: string;
  startDate?: Date;
  endDate?: Date;
  reportType?: ReportType;
  incidentTitle?: string;
  childData?: Child;
}

export function generatePDFReport(options: ReportOptions): void {
  const {
    records,
    childName = "Criança",
    startDate,
    endDate,
    reportType = "all",
    incidentTitle,
    childData,
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Helper function to calculate age
  const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return "Não informado";
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years < 1) {
      const totalMonths = months + (years * 12);
      return totalMonths === 1 ? "1 mês" : `${totalMonths} meses`;
    } else if (years === 1 && months === 0) {
      return "1 ano";
    } else if (years === 1) {
      return `1 ano e ${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else if (months === 0) {
      return `${years} anos`;
    } else {
      return `${years} anos e ${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
  };

  // Helper to format blood type
  const bloodTypeLabels: { [key: string]: string } = {
    'A+': 'A+', 'A-': 'A-', 'B+': 'B+', 'B-': 'B-',
    'AB+': 'AB+', 'AB-': 'AB-', 'O+': 'O+', 'O-': 'O-',
    'unknown': 'Não informado'
  };

  // Separate records by type based on report type
  let symptoms: Record[] = [];
  let medications: Record[] = [];

  if (
    reportType === "all" ||
    reportType === "medical" ||
    reportType === "incident"
  ) {
    symptoms = records.filter((r) => r.type === "symptom");
    medications = records.filter((r) => r.type === "medication");
  } else if (reportType === "symptoms") {
    symptoms = records.filter((r) => r.type === "symptom");
  } else if (reportType === "medications") {
    medications = records.filter((r) => r.type === "medication");
  }

  // Calculate statistics
  const temperatures = symptoms
    .filter((s) => s.temperature)
    .map((s) => s.temperature as number);
  const peakTemp = temperatures.length > 0 ? Math.max(...temperatures) : null;

  // ===== HEADER =====
  // Blue header background
  doc.setFillColor(96, 165, 250); // Blue 400
  doc.rect(0, 0, pageWidth, 35, "F");

  // Logo and title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Cubbi", pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const reportTitles = {
    all: "Relatório de Saúde - Completo",
    medical: "Relatório Médico",
    symptoms: "Relatório de Sintomas",
    medications: "Relatório de Medicações",
    incident: `Relatório de Incidente${
      incidentTitle ? `: ${incidentTitle}` : ""
    }`,
  };
  doc.text(reportTitles[reportType], pageWidth / 2, 25, { align: "center" });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // ===== CHILD INFO =====
  let yPosition = 45;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Criança: ${childName}`, margin, yPosition);

  if (startDate && endDate) {
    yPosition += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99); // Gray 600
    doc.text(
      `Período: ${startDate.toLocaleDateString(
        "pt-BR"
      )} até ${endDate.toLocaleDateString("pt-BR")}`,
      margin,
      yPosition
    );
  }

  // ===== CHILD MEDICAL INFO BOX =====
  if (childData) {
    yPosition += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(248, 250, 252); // Very light gray background
    doc.setDrawColor(203, 213, 225); // Gray border
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 2, 2, "FD");

    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Informações da Criança", margin + 4, yPosition);

    yPosition += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    const leftCol = margin + 4;
    const middleCol = margin + 70;
    const rightCol = margin + 136;

    // First row
    doc.text(`Idade: ${calculateAge(childData.birth_date)}`, leftCol, yPosition);
    doc.text(`Peso: ${childData.weight_kg ? `${childData.weight_kg} kg` : 'Não informado'}`, middleCol, yPosition);
    doc.text(`Altura: ${childData.height_cm ? `${childData.height_cm} cm` : 'Não informado'}`, rightCol, yPosition);

    // Second row
    yPosition += 5;
    doc.text(`Tipo Sanguíneo: ${childData.blood_type ? bloodTypeLabels[childData.blood_type] : 'Não informado'}`, leftCol, yPosition);
    doc.text(`Sexo: ${childData.sex === 'male' ? 'Masculino' : childData.sex === 'female' ? 'Feminino' : 'Não informado'}`, middleCol, yPosition);

    // Third row - Allergies
    yPosition += 5;
    const allergies = childData.allergies || 'Não informado';
    doc.text(`Alergias: ${allergies.length > 60 ? allergies.substring(0, 60) + '...' : allergies}`, leftCol, yPosition, { maxWidth: pageWidth - 2 * margin - 8 });

    // Fourth row - Medical conditions
    yPosition += 5;
    const medicalConditions = childData.medical_conditions || 'Não informado';
    doc.text(`Condições médicas: ${medicalConditions.length > 50 ? medicalConditions.substring(0, 50) + '...' : medicalConditions}`, leftCol, yPosition, { maxWidth: pageWidth - 2 * margin - 8 });
  }

  // ===== SUMMARY BOX =====
  yPosition += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(240, 249, 255); // Light blue background
  doc.setDrawColor(191, 219, 254); // Blue border
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 24, 2, 2, "FD");

  yPosition += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo", margin + 4, yPosition);

  yPosition += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Different summary text for medical vs normal report
  let summaryText = "";
  if (reportType === "medical") {
    summaryText = `Período de observação: ${medications.length} administrações medicamentosas e ${symptoms.length} manifestações sintomáticas.`;
    if (peakTemp) {
      summaryText += ` Temperatura máxima registrada: ${peakTemp.toFixed(1)}°C`;
      if (peakTemp >= 37.8) {
        summaryText += ` (estado febril)`;
      }
    }
  } else {
    summaryText = `Foram registrados ${medications.length} medicações e ${
      symptoms.length
    } sintoma${symptoms.length !== 1 ? "s" : ""}.`;
    if (peakTemp) {
      summaryText += ` Pico de temperatura: ${peakTemp.toFixed(1)}°C`;
    }
  }

  doc.text(summaryText, margin + 4, yPosition, {
    maxWidth: pageWidth - 2 * margin - 8,
  });

  // Helper function to add section header
  const addSectionHeader = (title: string, icon: string, y: number) => {
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.text(title, margin + 3, y + 5.5);
    doc.setTextColor(0, 0, 0);
  };

  // Helper function to draw table with alternating rows
  const drawRecordsTable = (recordsList: Record[], startY: number): number => {
    let y = startY;

    // Table headers
    y += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(226, 232, 240); // Slate 200
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 7, "F");

    // Different headers for medical report
    const headers =
      reportType === "medical"
        ? ["Data/Hora", "Descrição", "Achados", "Observações Clínicas"]
        : ["Data/Hora", "Título", "Detalhes", "Observações"];
    const colWidths = [35, 45, 50, 52];
    let x = margin + 2;

    headers.forEach((header, i) => {
      doc.text(header, x, y);
      x += colWidths[i];
    });

    // Table rows
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    recordsList.forEach((record, index) => {
      // Check if we need a new page
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251); // Gray 50
        doc.rect(margin, y - 3, pageWidth - 2 * margin, 9, "F");
      }

      x = margin + 2;

      // Date/Time
      const dateText = formatDateTime(record.created_at);
      doc.text(dateText, x, y, { maxWidth: colWidths[0] - 2 });
      x += colWidths[0];

      // Title
      doc.text(record.title, x, y, { maxWidth: colWidths[1] - 2 });
      x += colWidths[1];

      // Details
      const detailsText = record.temperature
        ? formatTemperature(record.temperature)
        : record.details;
      doc.text(detailsText, x, y, { maxWidth: colWidths[2] - 2 });
      x += colWidths[2];

      // Notes
      if (record.notes) {
        doc.text(
          record.notes.substring(0, 60) +
            (record.notes.length > 60 ? "..." : ""),
          x,
          y,
          { maxWidth: colWidths[3] - 2 }
        );
      }

      y += 9;
    });

    return y;
  };

  // ===== SYMPTOMS SECTION =====
  if (
    reportType === "all" ||
    reportType === "medical" ||
    reportType === "symptoms" ||
    reportType === "incident"
  ) {
    yPosition += 32;
    const symptomsTitle =
      reportType === "medical" ? "Manifestações Clínicas" : "Sintomas";
    addSectionHeader(symptomsTitle, "", yPosition);
    yPosition += 10; // Space after section header

    if (symptoms.length > 0) {
      yPosition = drawRecordsTable(symptoms, yPosition);
    } else {
      yPosition += 15;
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128); // Gray 500
      const noSymptomsText =
        reportType === "medical"
          ? "Nenhuma manifestação clínica registrada no período de observação."
          : "Nenhum sintoma registrado neste período.";
      doc.text(noSymptomsText, margin + 2, yPosition);
      doc.setTextColor(0, 0, 0);
    }
  }

  // ===== MEDICATIONS SECTION =====
  if (
    reportType === "all" ||
    reportType === "medical" ||
    reportType === "medications" ||
    reportType === "incident"
  ) {
    yPosition += 10;

    // Check if we need a new page
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    const medicationsTitle =
      reportType === "medical" ? "Terapêutica Medicamentosa" : "Medicações";
    addSectionHeader(medicationsTitle, "", yPosition);
    yPosition += 10; // Space after section header

    if (medications.length > 0) {
      yPosition = drawRecordsTable(medications, yPosition);
    } else {
      yPosition += 15;
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128); // Gray 500
      const noMedicationsText =
        reportType === "medical"
          ? "Nenhuma administração medicamentosa registrada no período."
          : "Nenhuma medicação registrada neste período.";
      doc.text(noMedicationsText, margin + 2, yPosition);
      doc.setTextColor(0, 0, 0);
    }
  }

  // ===== FOOTER ON ALL PAGES =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(229, 231, 235); // Gray 200
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128); // Gray 500
    doc.setFont("helvetica", "italic");

    if (reportType === "medical") {
      // Medical report footer with disclaimer
      doc.text(
        "Relatório gerado pelo Cubbi para fins médicos – Este documento contém informações de saúde confidenciais",
        pageWidth / 2,
        pageHeight - 12,
        { align: "center" }
      );
    } else {
      doc.text(
        "Gerado automaticamente pelo Cubbi – cubbi.app.br",
        pageWidth / 2,
        pageHeight - 12,
        { align: "center" }
      );
    }

    // Page number
    doc.setFont("helvetica", "normal");
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin,
      pageHeight - 12,
      { align: "right" }
    );
  }

  // Save the PDF
  const fileName = `cubbi-${childName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

export function generateCSVReport(options: ReportOptions): void {
  const { records, childName = "Criança", startDate, endDate } = options;

  let csv = "Data/Hora,Tipo,Título,Detalhes,Observações\n";

  records.forEach((record) => {
    const row = [
      formatDateTime(record.created_at),
      record.type === "symptom" ? "Sintoma" : "Medicação",
      record.title,
      record.temperature
        ? formatTemperature(record.temperature)
        : record.details,
      record.notes || "",
    ];

    // Escape fields that contain commas or quotes
    const escapedRow = row.map((field) => {
      if (field.includes(",") || field.includes('"') || field.includes("\n")) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    });

    csv += escapedRow.join(",") + "\n";
  });

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `cubbi-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
