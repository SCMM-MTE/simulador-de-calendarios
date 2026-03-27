'use client';

import { useEffect, useState, useMemo } from 'react';
import { useConfigStore } from '@/store/configStore';
import { useSimulatorStore } from '@/store/simulatorStore';
import { apiClient } from '@/lib/api-client';
import { calculateDayCategory, isHoliday, calculatePressureLevel } from '@/lib/utils/calendar';
import { getDaysInRange, formatDate, getISOWeek } from '@/lib/utils/helpers';
import { DAY_TYPE_COLORS, DAY_TYPE_EMOJIS } from '@/lib/constants/defaults';
import { MESES } from '@/lib/constants/seasons';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Panel } from '@/components/common/Panel';
import { IDayEntry, ISimulatorResult } from '@/lib/types/calendar';
import clsx from 'clsx';

interface CalendarProps {
  calendarType: 'A' | 'B' | 'C';
}

export function SimuladorCalendario({ calendarType }: CalendarProps) {
  const { config } = useConfigStore();
  const { results, setResult, isCalculating } = useSimulatorStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startYear] = useState(new Date().getFullYear());
  const [endYear] = useState(new Date().getFullYear());

  const result: ISimulatorResult | undefined = results[calendarType];

  // Calculate calendar on mount or when config/type changes
  useEffect(() => {
    const calculateCalendar = async () => {
      setLocalLoading(true);
      try {
        const startDate = `${startYear}-01-01`;
        const endDate = `${endYear}-12-31`;

        const apiResult = await apiClient.calculateCalendar(
          config,
          startDate,
          endDate,
          calendarType
        );

        if (apiResult.success && apiResult.data) {
          setResult(calendarType, apiResult.data);
        }
      } catch (error) {
        console.error('Error calculating calendar:', error);
      } finally {
        setLocalLoading(false);
      }
    };

    if (config.globalMTE > 0) {
      calculateCalendar();
    }
  }, [config, calendarType, startYear, endYear, setResult]);

  // Group days by week and month
  const daysByMonth = useMemo(() => {
    if (!result?.entries) return {};

    const grouped: { [month: string]: IDayEntry[] } = {};
    result.entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(entry);
    });

    return grouped;
  }, [result]);

  const getDayTypeColor = (dayType: string): string => {
    return DAY_TYPE_COLORS[dayType as keyof typeof DAY_TYPE_COLORS] || 'bg-gray-100';
  };

  const getDayTypeEmoji = (dayType: string): string => {
    return DAY_TYPE_EMOJIS[dayType as keyof typeof DAY_TYPE_EMOJIS] || '';
  };

  const handleExportToCSV = () => {
    if (!result?.entries) return;

    const headers = ['Fecha', 'Día', 'Tipo', 'Presión', 'Cuota'];
    const rows = result.entries.map(entry => [
      entry.date,
      new Date(entry.date).toLocaleDateString('es-ES', { weekday: 'long' }),
      entry.dayType,
      entry.pressure,
      entry.quota,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendario-${calendarType}-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (localLoading || isCalculating) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin text-4xl">⏳</div>
          <p className="text-gray-600">Calculando calendario...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay datos de calendario. Verifica la configuración.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" className="border-l-4 border-blue-500">
          <p className="text-xs text-gray-600 uppercase font-bold">Total Días</p>
          <p className="text-2xl font-black text-blue-900">{result.totalDays}</p>
        </Card>
        <Card padding="md" className="border-l-4 border-green-500">
          <p className="text-xs text-gray-600 uppercase font-bold">Asignados</p>
          <p className="text-2xl font-black text-green-900">{result.assignedDays}</p>
        </Card>
        <Card padding="md" className="border-l-4 border-purple-500">
          <p className="text-xs text-gray-600 uppercase font-bold">Utilización</p>
          <p className="text-2xl font-black text-purple-900">
            {((result.utilizationRate || 0) * 100).toFixed(1)}%
          </p>
        </Card>
        <Card padding="md" className="border-l-4 border-orange-500">
          <p className="text-xs text-gray-600 uppercase font-bold">Presión Promedio</p>
          <p className="text-2xl font-black text-orange-900">
            {((result.averagePressure || 0) / 10).toFixed(1)}
          </p>
        </Card>
      </div>

      {/* Legend */}
      <Panel title="📋 Leyenda de Colores" color="default" collapsible={true}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(DAY_TYPE_COLORS).map(([dayType, colorClass]) => (
            <div key={dayType} className="flex items-center gap-2">
              <div className={clsx('w-6 h-6 rounded flex items-center justify-center', colorClass)}>
                <span className="text-xs font-bold">{getDayTypeEmoji(dayType)}</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{dayType}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Calendar Grid by Month */}
      <div className="space-y-6">
        {Object.entries(daysByMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([monthKey, entries]) => {
            const [year, month] = monthKey.split('-');
            const monthNum = parseInt(month) - 1;
            const monthName = MESES[monthNum];
            const monthTotal = entries.length;
            const laboralDays = entries.filter(e => e.dayType === 'laboral').length;
            const weekendDays = entries.filter(e => e.dayType === 'sabado' || e.dayType === 'domingo').length;
            const holidayDays = entries.filter(e => e.dayType === 'festivo').length;

            // Group entries by week
            const weekGroups: { [week: number]: IDayEntry[] } = {};
            entries.forEach(entry => {
              const week = getISOWeek(new Date(entry.date));
              if (!weekGroups[week]) weekGroups[week] = [];
              weekGroups[week].push(entry);
            });

            return (
              <Panel
                key={monthKey}
                title={`${monthName.toUpperCase()} ${year}`}
                collapsible={true}
                color="default"
              >
                <div className="space-y-4">
                  {/* Month Stats */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-600 font-bold">Total</p>
                      <p className="text-lg font-black text-blue-900">{monthTotal}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-600 font-bold">Laborales</p>
                      <p className="text-lg font-black text-green-900">{laboralDays}</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-600 font-bold">F/S</p>
                      <p className="text-lg font-black text-orange-900">{weekendDays}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-600 font-bold">Festivos</p>
                      <p className="text-lg font-black text-red-900">{holidayDays}</p>
                    </div>
                  </div>

                  {/* Week Grid */}
                  <div className="space-y-3">
                    {Object.entries(weekGroups)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([week, weekDays]) => (
                        <div key={week} className="border border-gray-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Semana {week}</p>
                          <div className="grid grid-cols-7 gap-1">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
                              <div key={`header-${idx}`} className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase">{dayName.slice(0, 1)}</p>
                              </div>
                            ))}

                            {/* Fill empty slots at beginning of week */}
                            {weekDays.length > 0 && (() => {
                              const firstDay = new Date(weekDays[0].date);
                              const dayOfWeek = firstDay.getDay();
                              const emptySlots = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                              return Array.from({ length: emptySlots }).map((_, idx) => (
                                <div key={`empty-${idx}`}></div>
                              ));
                            })()}

                            {/* Day cells */}
                            {weekDays.map(entry => (
                              <button
                                key={entry.date}
                                onClick={() => setSelectedDate(entry.date)}
                                className={clsx(
                                  'aspect-square rounded border-2 flex flex-col items-center justify-center text-xs font-bold p-1 transition-all hover:shadow-md',
                                  getDayTypeColor(entry.dayType),
                                  selectedDate === entry.date ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                )}
                                title={`${entry.date} - ${entry.dayType} (Presión: ${(entry.pressure / 10).toFixed(1)})`}
                              >
                                <span>{new Date(entry.date).getDate()}</span>
                                <span className="text-[10px]">{getDayTypeEmoji(entry.dayType)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </Panel>
            );
          })}
      </div>

      {/* Selected Day Details */}
      {selectedDate && result.entries && (() => {
        const selected = result.entries.find(e => e.date === selectedDate);
        return (
          selected && (
            <Panel title={`📅 Detalles del ${selectedDate}`} collapsible={true} color="info">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase mb-1">Tipo de Día</p>
                  <p className="text-sm font-bold text-gray-800">{selected.dayType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase mb-1">Día Semana</p>
                  <p className="text-sm font-bold text-gray-800">
                    {new Date(selected.date).toLocaleDateString('es-ES', { weekday: 'long' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase mb-1">Presión</p>
                  <p className="text-sm font-bold text-orange-700">{(selected.pressure / 10).toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase mb-1">Cuota</p>
                  <p className="text-sm font-bold text-blue-700">{selected.quota}</p>
                </div>
              </div>
            </Panel>
          )
        );
      })()}

      {/* Export Actions */}
      <div className="flex gap-3 justify-center pt-4 border-t border-gray-200">
        <Button variant="primary" size="md" onClick={handleExportToCSV}>
          📊 Descargar CSV
        </Button>
        <Button variant="outline" size="md" disabled>
          🖼️ Exportar PNG (próximamente)
        </Button>
        <Button variant="outline" size="md" disabled>
          📄 Exportar PDF (próximamente)
        </Button>
      </div>
    </div>
  );
}
