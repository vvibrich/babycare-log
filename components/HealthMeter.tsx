"use client";

import { useState } from "react";
import { Record, Child } from "@/types/record";
import { analyzeRecords } from "@/lib/intelligentAnalysis";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsightsPanel } from "./InsightsPanel";
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthMeterProps {
  records: Record[];
  child?: Child;
}

type HealthStatus = "excellent" | "good" | "attention" | "alert";

interface HealthData {
  status: HealthStatus;
  score: number;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: any;
}

export function HealthMeter({ records, child }: HealthMeterProps) {
  const [showFullReport, setShowFullReport] = useState(false);

  const analysis = analyzeRecords(records);

  // Calcular status de saúde baseado nos insights
  // const getHealthStatus = (): HealthData => {
  //   const alertCount = analysis.insights.filter(i => i.type === 'alert').length;
  //   const warningCount = analysis.insights.filter(i => i.type === 'warning').length;
  //   const goodNewsCount = analysis.insights.filter(i => i.type === 'success').length;

  //   // Análise de saúde
  //   if (alertCount >= 2) {
  //     return {
  //       status: 'alert',
  //       score: 40,
  //       label: 'Requer Atenção',
  //       description: `${alertCount} alerta${alertCount !== 1 ? 's' : ''} importante${alertCount !== 1 ? 's' : ''}`,
  //       color: 'text-red-600 dark:text-red-400',
  //       bgColor: 'from-red-500 to-orange-500',
  //       icon: AlertTriangle,
  //     };
  //   }

  //   if (alertCount === 1 || warningCount >= 2) {
  //     return {
  //       status: 'attention',
  //       score: 65,
  //       label: 'Atenção Necessária',
  //       description: `${alertCount + warningCount} ponto${alertCount + warningCount !== 1 ? 's' : ''} de atenção`,
  //       color: 'text-yellow-600 dark:text-yellow-400',
  //       bgColor: 'from-yellow-500 to-orange-500',
  //       icon: Activity,
  //     };
  //   }

  //   if (goodNewsCount > 0 || analysis.insights.length > 0) {
  //     return {
  //       status: 'good',
  //       score: 85,
  //       label: 'Está Bem',
  //       description: goodNewsCount > 0 ? 'Sinais de melhora detectados' : 'Situação controlada',
  //       color: 'text-green-600 dark:text-green-400',
  //       bgColor: 'from-green-500 to-emerald-500',
  //       icon: CheckCircle,
  //     };
  //   }

  //   return {
  //     status: 'excellent',
  //     score: 100,
  //     label: 'Excelente',
  //     description: 'Nenhum problema detectado',
  //     color: 'text-emerald-600 dark:text-emerald-400',
  //     bgColor: 'from-emerald-500 to-green-500',
  //     icon: Heart,
  //   };
  // };
  const getHealthStatus = (): HealthData => {
    const alertCount = analysis.insights.filter(
      (i) => i.type === "alert"
    ).length;
    const warningCount = analysis.insights.filter(
      (i) => i.type === "warning"
    ).length;
    const goodNewsCount = analysis.insights.filter(
      (i) => i.type === "success"
    ).length;
    const neutralCount = analysis.insights.filter(
      (i) => i.type === "info"
    ).length;

    // Tendência: se há sintomas recorrentes mas também melhoras recentes
    const isRecovering =
      goodNewsCount > 0 && (alertCount > 0 || warningCount > 0);

    // 🔴 Estado crítico
    if (alertCount >= 3) {
      return {
        status: "alert",
        score: 35,
        label: "Alerta Vermelho",
        description:
          "Vários sinais preocupantes detectados — avalie contato médico.",
        color: "text-red-600 dark:text-red-400",
        bgColor: "from-red-600 to-orange-600",
        icon: AlertTriangle,
      };
    }

    // 🟠 Atenção reforçada (mistura de alertas e avisos)
    if (alertCount >= 1 && warningCount >= 2) {
      return {
        status: "attention",
        score: 55,
        label: "Atenção Reforçada",
        description: `${
          alertCount + warningCount
        } pontos que merecem observação cuidadosa.`,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "from-orange-500 to-yellow-500",
        icon: Activity,
      };
    }

    // 💛 Estado de observação (pequenas alterações, nada grave)
    if (warningCount === 1 && alertCount === 0) {
      return {
        status: "attention",
        score: 70,
        label: "Sob Observação",
        description: "Mudanças sutis detectadas, acompanhe os próximos dias.",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "from-yellow-400 to-amber-500",
        icon: Activity,
      };
    }

    // 💚 Recuperação (melhora recente após sintomas)
    if (isRecovering) {
      return {
        status: "good",
        score: 80,
        label: "Em Recuperação",
        description:
          "Sinais de melhora após período de atenção. Continue monitorando.",
        color: "text-green-600 dark:text-green-400",
        bgColor: "from-green-500 to-emerald-500",
        icon: CheckCircle,
      };
    }

    // 💙 Estado instável (picos e quedas nos registros)
    if (analysis.statistics.symptomsThisWeek >= 3 && goodNewsCount === 0) {
      return {
        status: "attention",
        score: 60,
        label: "Estado Instável",
        description: "Oscilações nos registros de sintomas recentes.",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "from-blue-500 to-cyan-500",
        icon: Activity,
      };
    }

    // 🩵 Saudável, mas com informações neutras recentes
    if (neutralCount > 0 && alertCount === 0 && warningCount === 0) {
      return {
        status: "good",
        score: 90,
        label: "Saudável",
        description:
          "Nenhum sinal de problema, mas dados recentes mantêm acompanhamento ativo.",
        color: "text-teal-600 dark:text-teal-400",
        bgColor: "from-teal-500 to-emerald-500",
        icon: Heart,
      };
    }

    // 💖 Saudável total
    if (goodNewsCount > 0 && analysis.insights.length === goodNewsCount) {
      return {
        status: "excellent",
        score: 100,
        label: "Excelente",
        description: "Nenhum problema detectado. Saúde em dia!",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "from-emerald-500 to-green-500",
        icon: Heart,
      };
    }

    // Caso base (sem dados)
    return {
      status: "excellent",
      score: 100,
      label: "Excelente",
      description: "Sem registros recentes de sintomas ou alertas.",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "from-emerald-500 to-green-500",
      icon: Heart,
    };
  };

  const healthData = getHealthStatus();
  const HealthIcon = healthData.icon;
  const childName = child?.name || "Criança";

  return (
    <div className="space-y-4">
      {/* Saúdometro Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Gradient Header */}
          <div
            className={cn(
              "relative p-6 bg-gradient-to-br",
              healthData.bgColor,
              "text-white"
            )}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>

            {/* Content */}
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="text-sm font-medium opacity-90">
                    Saúdometro IA
                  </h3>
                </div>
                <HealthIcon className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold">{childName}</h2>
                <p className="text-lg font-semibold">{healthData.label}</p>
                <p className="text-sm opacity-90">{healthData.description}</p>
              </div>

              {/* Score Circle */}
              <div className="mt-4 flex items-center gap-4">
                <div className="relative">
                  <svg className="w-20 h-20 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 36 * (1 - healthData.score / 100)
                      }`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">
                      {healthData.score}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-xs opacity-75 mb-1">Índice de Saúde</div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${healthData.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analysis.statistics.totalRecords}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Registros
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analysis.statistics.symptomsThisWeek}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Sintomas (7d)
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analysis.insights.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Insights</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão para ver relatório completo */}
      <Button
        variant="outline"
        className="w-full border-2 border-dashed hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20"
        onClick={() => setShowFullReport(!showFullReport)}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {showFullReport ? (
          <>
            <span>Ocultar Relatório Inteligente</span>
            <ChevronUp className="h-4 w-4 ml-2" />
          </>
        ) : (
          <>
            <span>Ver Relatório Inteligente Completo</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>

      {/* Relatório completo expandido */}
      {showFullReport && <InsightsPanel records={records} child={child} />}
    </div>
  );
}
