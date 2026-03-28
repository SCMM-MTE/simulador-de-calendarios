'use client';

import { useMemo } from 'react';
import { useSimulatorStore } from '@/store/simulatorStore';
import { useConfigStore } from '@/store/configStore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Panel } from '@/components/common/Panel';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ISimulatorResult } from '@/lib/types/calendar';
import clsx from 'clsx';

const SCENARIO_TYPES = ['A', 'B', 'C'] as const;
type ScenarioType = typeof SCENARIO_TYPES[number];

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  A: 'text-red-600 bg-red-50 border-red-200',
  B: 'text-blue-600 bg-blue-50 border-blue-200',
  C: 'text-green-600 bg-green-50 border-green-200',
};

const CHART_COLORS: Record<string, string> = {
  laboral: '#3b82f6',
  sabado: '#f59e0b',
  domingo: '#ef4444',
  festivo: '#8b5cf6',
  vacacion: '#10b981',
  descanso: '#6b7280',
};

// --- Sub-components for refactoring ---

function ScenarioSummaryCard({ type, result }: { type: ScenarioType; result: ISimulatorResult | undefined }) {
  if (!result) return null;

  return (
    <Card padding="md" className={SCENARIO_COLORS[type]}>
      <div className="text-center">
        <p className="text-xs font-bold uppercase mb-1">Calendario {type}</p>
        <p className="text-2xl font-black">{result.totalDays}</p>
        <p className="text-xs text-gray-600 mt-1">
          {result.assignedDays} asignados ({((result.utilizationRate || 0) * 100).toFixed(1)}%)
        </p>
      </div>
    </Card>
  );
}

function ScenarioPieChartPanel({ type, data }: { type: ScenarioType; data: any[] | undefined }) {
  return (
    <Panel title={`Calendario ${type}`} color="default" collapsible={false}>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS] || '#999'}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
      )}

      {/* Legend */}
      <div className="mt-4 space-y-2 text-xs">
        {data?.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  CHART_COLORS[entry.name as keyof typeof CHART_COLORS] || '#999',
              }}
            ></div>
            <span className="font-medium">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}


// --- Main Component ---

export function SimuladorAnalisis() {
  const { results } = useSimulatorStore();
  const { config } = useConfigStore();

  // Calculate summary data for each scenario
  const scenarioData = useMemo(() => {
    const scenarios: { [key in ScenarioType]?: ISimulatorResult & { type: ScenarioType } } = {};

    SCENARIO_TYPES.forEach(type => {
      if (results[type]) {
        scenarios[type] = { ...results[type], type };
      }
    });

    return scenarios;
  }, [results]);

  // Prepare chart data for distribution
  const distributionData = useMemo(() => {
    return SCENARIO_TYPES.map(type => {
      const result = scenarioData[type];
      if (!result?.entries) return null;

      const counts = {
        laboral: 0, sabado: 0, domingo: 0, festivo: 0, vacacion: 0, descanso: 0,
      };

      result.entries.forEach(entry => {
        const dayType = entry.dayType as keyof typeof counts;
        if (dayType in counts) {
          counts[dayType]++;
        }
      }
    );

      return { name: `Cal. ${type}`, ...counts };
    }).filter(Boolean);
  }, [scenarioData]);

  // Prepare pie chart data for each scenario
  const pieData = useMemo(() => {
    const data: { [key in ScenarioType]?: any[] } = {};

    SCENARIO_TYPES.forEach(type => {
      const result = scenarioData[type];
      if (result?.entries) {
        const counts: { [key: string]: number } = {};

        result.entries.forEach(entry => {
          const dayType = entry.dayType;
          counts[dayType] = (counts[dayType] || 0) + 1;
        });

        data[type] = Object.entries(counts).map(([name, value]) => ({
          name,
          value,
        }));
      }
    });

    return data;
  }, [scenarioData]);

  const handleExportAnalysis = () => {
    const csv = [
      ['Escenario', 'Total Días', 'Asignados', 'Utilización', 'Presión Promedio'].join(','),
      ...SCENARIO_TYPES.map(type => {
        const result = scenarioData[type];
        if (!result) return '';
        return [
          `Cal. ${type}`,
          result.totalDays,
          result.assignedDays,
          (result.utilizationRate * 100).toFixed(2),
          (result.averagePressure / 10).toFixed(2),
        ].join(',');
      }),
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-comparativo-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIO_TYPES.map(type => (
          <ScenarioSummaryCard key={type} type={type} result={scenarioData[type]} />
        ))}
      </div>

      {/* Bar Chart - Distribution Comparison */}
      {distributionData.length > 0 && (
        <Panel title="📊 Distribución por Tipo de Día" color="default" collapsible={true}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="laboral" fill={CHART_COLORS.laboral} name="Laborales" />
              <Bar dataKey="sabado" fill={CHART_COLORS.sabado} name="Sábados" />
              <Bar dataKey="domingo" fill={CHART_COLORS.domingo} name="Domingos" />
              <Bar dataKey="festivo" fill={CHART_COLORS.festivo} name="Festivos" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SCENARIO_TYPES.map(type => (
          <ScenarioPieChartPanel key={type} type={type} data={pieData[type]} />
        ))}
      </div>

      {/* Detailed Comparison Table */}
      <Panel title="📋 Comparativa Detallada" color="default" collapsible={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="text-left py-2 px-3 font-bold">Métrica</th>
                {SCENARIO_TYPES.map(type => (
                  <th key={type} className="text-center py-2 px-3 font-bold">
                    Cal. {type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonTableRows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 font-medium">{row.label}</td>
                  {SCENARIO_TYPES.map(type => {
                    const result = scenarioData[type];
                    const value = result ? (result[row.key as keyof typeof result] as number) : 0;
                    const formatted = row.format ? row.format(value) : value;

                    return (
                      <td key={type} className="text-center py-2 px-3 font-bold">
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Group Distribution Analysis */}
      <Panel title="👥 Distribución por Grupo (si aplica)" color="default" collapsible={true}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCENARIO_TYPES.map(type => {
            const result = scenarioData[type];
            if (!result?.groupDistribution) return null;

            return (
              <div key={type} className="space-y-2">
                <p className="font-bold text-gray-800">Calendario {type}</p>
                {Object.entries(result.groupDistribution).map(([group, count]) => (
                  <div key={group} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-700">{group}</span>
                    <span className="font-bold text-blue-700">{count as number}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Export Button */}
      <div className="flex justify-center pt-4 border-t border-gray-200">
        <Button variant="primary" size="md" onClick={handleExportAnalysis}>
          📥 Exportar Análisis CSV
        </Button>
      </div>
    </div>
  );
}
