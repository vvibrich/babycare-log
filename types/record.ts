export type RecordType = 'symptom' | 'medication';

export type SymptomType = 
  | 'temperatura'
  | 'febre' // Mantido para compatibilidade com registros antigos
  | 'tosse'
  | 'congestao_nasal'
  | 'diarreia'
  | 'vomito'
  | 'dor_cabeca'
  | 'dor_barriga'
  | 'irritacao'
  | 'falta_apetite'
  | 'outro';

export interface Child {
  id: string;
  name: string;
  birth_date?: string;
  photo_url?: string;
  notes?: string;
  created_at: string;
  is_active: boolean;
}

export interface Record {
  id: string;
  type: RecordType;
  title: string;
  details: string;
  notes?: string;
  created_at: string;
  symptom_type?: SymptomType | null;
  temperature?: number | null;
  child_id?: string | null;
  reminder_interval_hours?: number | null;
  reminder_enabled?: boolean;
  next_dose_at?: string | null;
  photo_url?: string | null;
  user_id?: string;
  user_email?: string;
  incident_id?: string | null;
}

export type IncidentStatus = 'active' | 'resolved' | 'monitoring';
export type IncidentSeverity = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  child_id: string;
  user_id: string;
  title: string;
  description?: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  started_at: string;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecordFormData {
  type: RecordType;
  title: string;
  details: string;
  notes?: string;
  symptom_type?: SymptomType;
  temperature?: number;
}

export const symptomTypeLabels: { [K in SymptomType]: string } = {
  temperatura: '🌡️ Temperatura',
  febre: '🤒 Febre (legado)', // Mantido para compatibilidade
  tosse: '😷 Tosse',
  congestao_nasal: '🤧 Congestão Nasal',
  diarreia: '💩 Diarreia',
  vomito: '🤮 Vômito',
  dor_cabeca: '🤕 Dor de Cabeça',
  dor_barriga: '😣 Dor de Barriga',
  irritacao: '😤 Irritação/Choro',
  falta_apetite: '🍽️ Falta de Apetite',
  outro: '📝 Outro',
};

// Constante para limite de febre
export const FEVER_THRESHOLD = 37.8;

// Função para verificar se temperatura indica febre
export const isFever = (temperature?: number | null): boolean => {
  return temperature !== null && temperature !== undefined && temperature >= FEVER_THRESHOLD;
};

// Função para formatar exibição de temperatura
export const formatTemperature = (temperature?: number | null): string => {
  if (temperature === null || temperature === undefined) return '';
  const tempStr = `${temperature.toFixed(1)}°C`;
  return isFever(temperature) ? `${tempStr} (Febre)` : tempStr;
};
