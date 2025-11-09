'use client';

import { useMemo } from 'react';
import { Record, Child } from '@/types/record';
import { analyzeRecords, Insight } from '@/lib/intelligentAnalysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Activity } from 'lucide-react';

interface InsightsPanelProps {
  records: Record[];
  child?: Child | null;
}

export function InsightsPanel({ records, child }: InsightsPanelProps) {
  const analysis = useMemo(() => {
    return analyzeRecords(records, child?.name);
  }, [records, child?.name]);

  if (records.length === 0) {
    return null;
  }

  const { insights, statistics } = analysis;

  // Tipo de insight para estilo
  const getInsightStyle = (type: Insight['type']) => {
    switch (type) {
      case 'alert':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        };
    }
  };

  const getTypeLabel = (type: Insight['type']) => {
    switch (type) {
      case 'alert':
        return 'Alerta';
      case 'warning':
        return 'Atenção';
      case 'success':
        return 'Boa notícia';
      case 'info':
        return 'Informação';
    }
  };

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 dark:border-purple-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl text-purple-700 dark:text-purple-400">
          <Sparkles className="h-5 w-5" />
          Relatório Inteligente
        </CardTitle>
        <CardDescription>
          Análise automática baseada nos registros {child?.name ? `de ${child.name}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border text-center">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {statistics.totalRecords}
            </p>
            <p className="text-xs text-muted-foreground">registros</p>
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border text-center">
            <p className="text-xs text-muted-foreground mb-1">Esta semana</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {statistics.symptomsThisWeek}
            </p>
            <p className="text-xs text-muted-foreground">sintomas</p>
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border text-center">
            <p className="text-xs text-muted-foreground mb-1">Esta semana</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.medicationsThisWeek}
            </p>
            <p className="text-xs text-muted-foreground">medicações</p>
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border text-center">
            <p className="text-xs text-muted-foreground mb-1">Dias c/ febre</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {statistics.daysWithFever}
            </p>
            <p className="text-xs text-muted-foreground">
              {statistics.daysWithFever === 1 ? 'dia' : 'dias'}
            </p>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-400">
              <Activity className="h-4 w-4" />
              <span>Análises e Alertas</span>
            </div>
            
            {insights.map((insight) => {
              const style = getInsightStyle(insight.type);
              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border-2 ${style.bg} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-2xl ${style.icon}`}>
                      {insight.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {insight.title}
                        </h4>
                        <Badge className={`text-xs ${style.badge}`}>
                          {getTypeLabel(insight.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg border">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-green-600 dark:text-green-400" />
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Tudo tranquilo!
            </p>
            <p className="text-sm text-muted-foreground">
              Não há alertas ou padrões preocupantes nos registros recentes.
            </p>
          </div>
        )}

        {/* Média de Temperatura */}
        {statistics.averageTemperature !== null && (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🌡️ Temperatura média
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {statistics.averageTemperature.toFixed(1)}°C
              </span>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="pt-2 border-t">
          <p className="text-xs text-center text-muted-foreground">
            💡 Análise baseada em {statistics.totalRecords} registro(s) • Atualizado automaticamente
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
