'use client';

import { Record } from '@/types/record';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TemperatureChartProps {
  records: Record[];
}

interface TemperatureData {
  date: string;
  timestamp: number;
  temperature: number;
  title: string;
  notes?: string;
}

function extractTemperature(details: string): number | null {
  // Patterns to match temperature values
  // Examples: "38°C", "38.5°C", "38,5", "38", "Temperatura: 38.5°C"
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*°?\s*c/i,  // 38°C, 38.5°C or 38.5 C
    /(\d+(?:[.,]\d+)?)\s*graus?/i,   // 38 graus, 38.5 graus
    /temperatura[:\s]+(\d+(?:[.,]\d+)?)/i, // Temperatura: 38, Temperatura: 38.5
    /febre\s+(?:de\s+)?(\d+(?:[.,]\d+)?)/i, // Febre de 38, Febre 38.5
    /(\d+(?:[.,]\d+)?)\s*(?:graus)?$/,  // Just number like 38 or 38.5 at end
  ];

  for (const pattern of patterns) {
    const match = details.match(pattern);
    if (match) {
      const temp = parseFloat(match[1].replace(',', '.'));
      // Validate if it's a reasonable temperature (between 35 and 42 degrees Celsius)
      if (temp >= 35 && temp <= 42) {
        return temp;
      }
    }
  }

  return null;
}

export function TemperatureChart({ records }: TemperatureChartProps) {
  // Filter symptom records and extract temperature data
  const temperatureData: TemperatureData[] = records
    .filter(record => record.type === 'symptom')
    .reduce<TemperatureData[]>((acc, record) => {
      // Use the temperature field if available (new format)
      let temperature = record.temperature || null;
      
      // Fallback to extracting from details (old format)
      if (temperature === null) {
        temperature = extractTemperature(record.details);
      }
      
      if (temperature === null) return acc;

      acc.push({
        date: format(new Date(record.created_at), 'dd/MM HH:mm', { locale: ptBR }),
        timestamp: new Date(record.created_at).getTime(),
        temperature,
        title: record.title,
        notes: record.notes,
      });
      
      return acc;
    }, [])
    .sort((a, b) => a.timestamp - b.timestamp);

  if (temperatureData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Gráfico de Temperatura
          </CardTitle>
          <CardDescription>
            Acompanhe a evolução da temperatura ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">Nenhum registro de temperatura encontrado</p>
            <p className="text-sm mt-2">
              Adicione sintomas com valores de temperatura para ver o gráfico
            </p>
            <p className="text-xs mt-4 text-muted-foreground/70">
              Exemplos de formato aceito: "38.5°C", "Temperatura 38,5", "38.7 graus"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const temperatures = temperatureData.map(d => d.temperature);
  const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Gráfico de Temperatura
        </CardTitle>
        <CardDescription>
          Evolução da temperatura registrada • {temperatureData.length} medições
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Média</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgTemp.toFixed(1)}°C</p>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Máxima</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{maxTemp.toFixed(1)}°C</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Mínima</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{minTemp.toFixed(1)}°C</p>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
          <LineChart data={temperatureData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '10px' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={[35, 42]}
              stroke="#6b7280"
              style={{ fontSize: '11px' }}
              width={50}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperatura']}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Legend />
            
            {/* Reference line for normal temperature */}
            <ReferenceLine 
              y={37} 
              stroke="#10b981" 
              strokeDasharray="3 3" 
              label={{ value: 'Normal', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }}
            />
            
            {/* Reference line for fever threshold */}
            <ReferenceLine 
              y={37.8} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              label={{ value: 'Febre', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }}
            />
            
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
              name="Temperatura"
            />
          </LineChart>
        </ResponsiveContainer>
        </div>

        {/* Legend explanation */}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 <strong>Dica:</strong> Clique em um ponto do gráfico para ver mais detalhes da medição.</p>
        </div>
      </CardContent>
    </Card>
  );
}
