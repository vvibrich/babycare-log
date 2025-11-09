import { Record, isFever, FEVER_THRESHOLD } from '@/types/record';
import { differenceInDays, parseISO, startOfDay, isAfter, subDays, subWeeks } from 'date-fns';

export interface Insight {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  description: string;
  icon: string;
  priority: number; // 1-5, onde 5 é mais importante
}

export interface AnalysisResult {
  insights: Insight[];
  statistics: {
    totalRecords: number;
    symptomsThisWeek: number;
    medicationsThisWeek: number;
    averageTemperature: number | null;
    daysWithFever: number;
  };
}

// Função principal de análise
export function analyzeRecords(records: Record[], childName?: string): AnalysisResult {
  const insights: Insight[] = [];
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  
  // Filtrar registros da última semana
  const recentRecords = records.filter(r => 
    isAfter(parseISO(r.created_at), oneWeekAgo)
  );

  // Estatísticas básicas
  const symptomsThisWeek = recentRecords.filter(r => r.type === 'symptom').length;
  const medicationsThisWeek = recentRecords.filter(r => r.type === 'medication').length;
  
  // 1. Análise de febre consecutiva
  const feverAnalysis = analyzeFeverPattern(records);
  if (feverAnalysis) insights.push(feverAnalysis);

  // 2. Análise de medicações frequentes
  const medicationAnalysis = analyzeMedicationFrequency(recentRecords, childName);
  if (medicationAnalysis) insights.push(medicationAnalysis);

  // 3. Análise de sintomas recorrentes
  const symptomAnalysis = analyzeRecurrentSymptoms(recentRecords, childName);
  if (symptomAnalysis) insights.push(symptomAnalysis);

  // 4. Análise de temperatura
  const temperatureAnalysis = analyzeTemperature(records);
  if (temperatureAnalysis) insights.push(temperatureAnalysis);

  // 5. Alertas de sintomas graves
  const severeSymptomAlert = checkSevereSymptoms(recentRecords, childName);
  if (severeSymptomAlert) insights.push(severeSymptomAlert);

  // 6. Padrão de melhora
  const improvementPattern = analyzeImprovement(records, childName);
  if (improvementPattern) insights.push(improvementPattern);

  // 7. Sem registros recentes
  const inactivityAlert = checkInactivity(records);
  if (inactivityAlert) insights.push(inactivityAlert);

  // Calcular média de temperatura
  const temperatures = records
    .filter(r => r.temperature !== null && r.temperature !== undefined)
    .map(r => r.temperature!);
  const averageTemperature = temperatures.length > 0
    ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length
    : null;

  // Contar dias com febre
  const daysWithFever = countDaysWithFever(records);

  // Ordenar insights por prioridade
  insights.sort((a, b) => b.priority - a.priority);

  return {
    insights,
    statistics: {
      totalRecords: records.length,
      symptomsThisWeek,
      medicationsThisWeek,
      averageTemperature,
      daysWithFever,
    },
  };
}

// Detecta febre por dias consecutivos
function analyzeFeverPattern(records: Record[]): Insight | null {
  const feverRecords = records
    .filter(r => r.temperature && isFever(r.temperature))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (feverRecords.length === 0) return null;

  // Agrupar por dia
  const feverDays = new Set(
    feverRecords.map(r => startOfDay(parseISO(r.created_at)).toISOString())
  );

  const consecutiveDays = findConsecutiveDays(Array.from(feverDays).map(d => parseISO(d)));
  
  if (consecutiveDays >= 2) {
    return {
      id: 'fever-consecutive',
      type: 'alert',
      title: `Febre por ${consecutiveDays} dias seguidos`,
      description: `Foi detectada febre (≥ ${FEVER_THRESHOLD}°C) em ${consecutiveDays} dias consecutivos. Considere consultar um médico se a febre persistir.`,
      icon: '🌡️',
      priority: 5,
    };
  }

  if (feverDays.size >= 3) {
    return {
      id: 'fever-multiple',
      type: 'warning',
      title: `Febre registrada em ${feverDays.size} dias`,
      description: `Foram detectados episódios de febre em ${feverDays.size} dias diferentes. Acompanhe a evolução.`,
      icon: '🌡️',
      priority: 4,
    };
  }

  return null;
}

// Analisa frequência de medicações
function analyzeMedicationFrequency(records: Record[], childName?: string): Insight | null {
  const medications = records.filter(r => r.type === 'medication');
  
  if (medications.length === 0) return null;

  const name = childName || 'A criança';

  if (medications.length >= 5) {
    return {
      id: 'medication-frequent',
      type: 'warning',
      title: `${medications.length} medicações esta semana`,
      description: `${name} recebeu ${medications.length} doses de medicamento nos últimos 7 dias. Certifique-se de seguir as orientações médicas.`,
      icon: '💊',
      priority: 3,
    };
  }

  if (medications.length >= 3) {
    return {
      id: 'medication-moderate',
      type: 'info',
      title: `${medications.length} medicações esta semana`,
      description: `Foram administradas ${medications.length} doses de medicamento nos últimos 7 dias.`,
      icon: '💊',
      priority: 2,
    };
  }

  return null;
}

// Analisa sintomas recorrentes
function analyzeRecurrentSymptoms(records: Record[], childName?: string): Insight | null {
  const symptoms = records.filter(r => r.type === 'symptom' && r.symptom_type);
  
  if (symptoms.length < 3) return null;

  // Contar sintomas por tipo
  const symptomCount: { [key: string]: number } = {};
  symptoms.forEach(s => {
    if (s.symptom_type) {
      symptomCount[s.symptom_type] = (symptomCount[s.symptom_type] || 0) + 1;
    }
  });

  // Encontrar sintoma mais frequente
  const mostFrequent = Object.entries(symptomCount)
    .sort(([, a], [, b]) => b - a)[0];

  if (mostFrequent && mostFrequent[1] >= 3) {
    const symptomLabels: { [key: string]: string } = {
      temperatura: 'temperatura elevada',
      tosse: 'tosse',
      congestao_nasal: 'congestão nasal',
      diarreia: 'diarreia',
      vomito: 'vômito',
      dor_cabeca: 'dor de cabeça',
      dor_barriga: 'dor de barriga',
      irritacao: 'irritação',
      falta_apetite: 'falta de apetite',
    };

    const name = childName || 'A criança';
    const symptomName = symptomLabels[mostFrequent[0]] || mostFrequent[0];

    return {
      id: 'symptom-recurrent',
      type: 'warning',
      title: `Sintoma recorrente: ${symptomName}`,
      description: `${name} apresentou ${symptomName} ${mostFrequent[1]} vezes esta semana. Monitore a evolução.`,
      icon: '⚠️',
      priority: 3,
    };
  }

  return null;
}

// Analisa padrão de temperatura
function analyzeTemperature(records: Record[]): Insight | null {
  const temperatures = records
    .filter(r => r.temperature !== null && r.temperature !== undefined)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (temperatures.length < 3) return null;

  const recent = temperatures.slice(0, 3);
  const recentTemps = recent.map(r => r.temperature!);

  // Verificar se está melhorando (temperaturas decrescendo)
  const isImproving = recentTemps.every((temp, i) => 
    i === 0 || temp <= recentTemps[i - 1]
  );

  if (isImproving && recentTemps[0] < FEVER_THRESHOLD && recentTemps[recentTemps.length - 1] >= FEVER_THRESHOLD) {
    return {
      id: 'temperature-improving',
      type: 'success',
      title: 'Temperatura normalizando',
      description: `A temperatura está diminuindo progressivamente. Última medição: ${recentTemps[0].toFixed(1)}°C.`,
      icon: '✅',
      priority: 2,
    };
  }

  // Verificar se está aumentando
  const isIncreasing = recentTemps.every((temp, i) => 
    i === 0 || temp >= recentTemps[i - 1]
  );

  if (isIncreasing && recentTemps[0] >= FEVER_THRESHOLD) {
    return {
      id: 'temperature-increasing',
      type: 'alert',
      title: 'Temperatura em elevação',
      description: `A temperatura está aumentando. Última medição: ${recentTemps[0].toFixed(1)}°C. Considere medidas antitérmicas.`,
      icon: '📈',
      priority: 4,
    };
  }

  return null;
}

// Verifica sintomas graves
function checkSevereSymptoms(records: Record[], childName?: string): Insight | null {
  const severeSymptoms = records.filter(r => 
    r.type === 'symptom' && (
      r.symptom_type === 'vomito' || 
      r.symptom_type === 'diarreia' ||
      (r.temperature && r.temperature >= 39.5)
    )
  );

  if (severeSymptoms.length >= 2) {
    const name = childName || 'A criança';
    const hasHighFever = severeSymptoms.some(s => s.temperature && s.temperature >= 39.5);
    
    return {
      id: 'severe-symptoms',
      type: 'alert',
      title: 'Sintomas que requerem atenção',
      description: hasHighFever 
        ? `${name} apresentou febre alta (≥ 39.5°C). Considere procurar atendimento médico.`
        : `${name} apresentou sintomas que podem indicar desidratação. Mantenha a hidratação e consulte um médico se necessário.`,
      icon: '🚨',
      priority: 5,
    };
  }

  return null;
}

// Analisa padrão de melhora
function analyzeImprovement(records: Record[], childName?: string): Insight | null {
  const now = new Date();
  const threeDaysAgo = subDays(now, 3);
  const oneWeekAgo = subWeeks(now, 1);

  const recentSymptoms = records.filter(r => 
    r.type === 'symptom' && isAfter(parseISO(r.created_at), threeDaysAgo)
  );

  const olderSymptoms = records.filter(r => 
    r.type === 'symptom' && 
    isAfter(parseISO(r.created_at), oneWeekAgo) &&
    !isAfter(parseISO(r.created_at), threeDaysAgo)
  );

  if (olderSymptoms.length >= 3 && recentSymptoms.length === 0) {
    const name = childName || 'A criança';
    return {
      id: 'improvement',
      type: 'success',
      title: 'Sinais de melhora',
      description: `${name} não apresentou novos sintomas nos últimos 3 dias. Continue monitorando.`,
      icon: '🎉',
      priority: 2,
    };
  }

  return null;
}

// Verifica inatividade no registro
function checkInactivity(records: Record[]): Insight | null {
  if (records.length === 0) return null;

  const lastRecord = records.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  const daysSinceLastRecord = differenceInDays(new Date(), parseISO(lastRecord.created_at));

  if (daysSinceLastRecord >= 7) {
    return {
      id: 'inactivity',
      type: 'info',
      title: 'Nenhum registro recente',
      description: `Não há registros nos últimos ${daysSinceLastRecord} dias. Tudo bem? Continue registrando para melhor acompanhamento.`,
      icon: '📝',
      priority: 1,
    };
  }

  return null;
}

// Funções auxiliares

function findConsecutiveDays(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = dates
    .map(d => startOfDay(d).getTime())
    .sort((a, b) => a - b);

  let maxConsecutive = 1;
  let currentConsecutive = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diffDays = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else if (diffDays > 1) {
      currentConsecutive = 1;
    }
  }

  return maxConsecutive;
}

function countDaysWithFever(records: Record[]): number {
  const feverDays = new Set(
    records
      .filter(r => r.temperature && isFever(r.temperature))
      .map(r => startOfDay(parseISO(r.created_at)).toISOString())
  );

  return feverDays.size;
}
