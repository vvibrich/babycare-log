'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Incident, Record } from '@/types/record';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IncidentCard } from './IncidentCard';
import { CreateIncidentDialog } from './CreateIncidentDialog';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface IncidentsPanelProps {
  childId: string;
  records: Record[];
}

export function IncidentsPanel({ childId, records }: IncidentsPanelProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, [childId]);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existe (migration não aplicada), apenas retorna vazio
        if (error.message?.includes('relation "incidents" does not exist')) {
          console.warn('Tabela incidents não encontrada. Aplique a migration 009_add_incidents.sql');
          setIncidents([]);
          return;
        }
        throw error;
      }

      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">Carregando incidentes...</p>
        </CardContent>
      </Card>
    );
  }

  if (incidents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Incidentes
          </CardTitle>
          <CardDescription>
            Agrupe sintomas e medicações relacionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Nenhum incidente registrado ainda
            </p>
            <CreateIncidentDialog childId={childId} onIncidentCreated={fetchIncidents} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5" />
              Incidentes
              {activeIncidents.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold">
                  {activeIncidents.length}
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Agrupe sintomas e medicações relacionados
            </CardDescription>
          </div>
          <CreateIncidentDialog childId={childId} onIncidentCreated={fetchIncidents} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Active Incidents */}
        {activeIncidents.length > 0 ? (
          <div className="space-y-3">
            {activeIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                records={records}
                onStatusChange={fetchIncidents}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum incidente ativo no momento
          </p>
        )}

        {/* Resolved Incidents (Collapsible) */}
        {resolvedIncidents.length > 0 && (
          <div className="pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResolved(!showResolved)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {showResolved ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Ocultar incidentes resolvidos ({resolvedIncidents.length})
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Ver incidentes resolvidos ({resolvedIncidents.length})
                </>
              )}
            </Button>

            {showResolved && (
              <div className="space-y-3 mt-3">
                {resolvedIncidents.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    records={records}
                    onStatusChange={fetchIncidents}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
