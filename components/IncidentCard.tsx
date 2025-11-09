'use client';

import { useState } from 'react';
import { Incident, Record, IncidentStatus, IncidentSeverity } from '@/types/record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  FileDown,
  Clock
} from 'lucide-react';
import { formatDateTime } from '@/utils/formatDate';
import { supabase } from '@/lib/supabaseClient';
import { generatePDFReport } from '@/lib/generateReport';
import { cn } from '@/lib/utils';

interface IncidentCardProps {
  incident: Incident;
  records: Record[];
  onStatusChange: () => void;
}

export function IncidentCard({ incident, records, onStatusChange }: IncidentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getSeverityConfig = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'high':
        return {
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-950/20',
          badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
          label: 'Alta',
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-50 dark:bg-yellow-950/20',
          badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
          label: 'Média',
        };
      case 'low':
      default:
        return {
          icon: Info,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
          label: 'Baixa',
        };
    }
  };

  const getStatusConfig = (status: IncidentStatus) => {
    switch (status) {
      case 'resolved':
        return {
          icon: CheckCircle2,
          label: 'Resolvido',
          badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        };
      case 'monitoring':
        return {
          icon: Eye,
          label: 'Monitorando',
          badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
        };
      case 'active':
      default:
        return {
          icon: Clock,
          label: 'Ativo',
          badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
        };
    }
  };

  const severityConfig = getSeverityConfig(incident.severity);
  const statusConfig = getStatusConfig(incident.status);
  const SeverityIcon = severityConfig.icon;
  const StatusIcon = statusConfig.icon;

  const incidentRecords = records.filter(r => r.incident_id === incident.id);
  const symptomsCount = incidentRecords.filter(r => r.type === 'symptom').length;
  const medicationsCount = incidentRecords.filter(r => r.type === 'medication').length;

  // Debug: verificar se incident_id está chegando
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Incidente "${incident.title}":`, {
      incident_id: incident.id,
      total_records: records.length,
      records_with_incident_id: records.filter(r => r.incident_id).length,
      matching_records: incidentRecords.length,
      sample_record: records[0],
    });
  }

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    setIsUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'resolved' && !incident.resolved_at) {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', incident.id);

      if (error) throw error;

      onStatusChange();
    } catch (error) {
      console.error('Error updating incident status:', error);
      alert('Erro ao atualizar status do incidente');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportPDF = () => {
    generatePDFReport({
      records: incidentRecords,
      childName: `Incidente: ${incident.title}`,
      startDate: new Date(incident.started_at),
      endDate: incident.resolved_at ? new Date(incident.resolved_at) : new Date(),
    });
  };

  return (
    <Card className={cn('border-2 shadow-sm hover:shadow-md transition-shadow', severityConfig.bg)}>
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Header with icon and title */}
          <div className="flex items-start gap-2">
            <div className={cn(
              'flex-shrink-0 p-2 rounded-lg',
              severityConfig.bg.replace('bg-', 'bg-').replace('dark:bg-', 'dark:bg-')
            )}>
              <SeverityIcon className={cn('h-5 w-5', severityConfig.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-bold leading-tight mb-1">
                {incident.title}
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Badge className={cn('text-xs px-1.5 py-0.5', statusConfig.badge)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                <Badge className={cn('text-xs px-1.5 py-0.5', severityConfig.badge)}>
                  {severityConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {incident.description && (
            <p className="text-sm text-muted-foreground leading-relaxed pl-11">
              {incident.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 pl-11 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-base">🩺</span>
              <span className="font-medium">{symptomsCount}</span>
              <span className="text-muted-foreground text-xs">sintoma{symptomsCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base">💊</span>
              <span className="font-medium">{medicationsCount}</span>
              <span className="text-muted-foreground text-xs">medicaç{medicationsCount !== 1 ? 'ões' : 'ão'}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Iniciado em {formatDateTime(incident.started_at)}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1.5" />
                <span className="text-xs sm:text-sm">Ocultar</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1.5" />
                <span className="text-xs sm:text-sm">Ver ({incidentRecords.length})</span>
              </>
            )}
          </Button>

          {incident.status !== 'resolved' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('resolved')}
              disabled={isUpdating}
              className="w-full text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/20"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span className="text-xs sm:text-sm">Resolver</span>
            </Button>
          ) : (
            incidentRecords.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPDF}
                className="w-full"
              >
                <FileDown className="h-4 w-4 mr-1.5" />
                <span className="text-xs sm:text-sm">PDF</span>
              </Button>
            )
          )}
        </div>

        {/* Export PDF for active incidents (on separate row) */}
        {incident.status !== 'resolved' && incidentRecords.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExportPDF}
            className="w-full text-xs"
          >
            <FileDown className="h-3.5 w-3.5 mr-1.5" />
            Exportar PDF
          </Button>
        )}

        {/* Expanded Records List */}
        {isExpanded && incidentRecords.length > 0 && (
          <div className="space-y-2 border-t pt-3 -mx-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              {incidentRecords.length} registro{incidentRecords.length !== 1 ? 's' : ''} associado{incidentRecords.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1.5">
              {incidentRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-lg border hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      'flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold mt-0.5',
                      record.type === 'symptom'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    )}>
                      {record.type === 'symptom' ? '🩺' : '💊'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight">{record.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {record.details}
                      </p>
                      <p className="text-xs text-muted-foreground/80 mt-1.5">
                        📅 {formatDateTime(record.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isExpanded && incidentRecords.length === 0 && (
          <div className="text-center py-6 border-t">
            <p className="text-sm text-muted-foreground">
              Nenhum registro associado ainda
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vincule sintomas ou medicações a este incidente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
