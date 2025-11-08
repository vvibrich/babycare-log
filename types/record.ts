export type RecordType = 'symptom' | 'medication';

export type SymptomType = 
  | 'febre'
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
  febre: '🤒 Febre',
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
