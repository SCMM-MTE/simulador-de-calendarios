'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRotationStore } from '@/store/rotationStore';
import { useConfigStore } from '@/store/configStore';
import { generateRotationSequence, getRestDaysForUnit, calculateFairnessScore } from '@/lib/utils/rotation';
import { getDaysInRange } from '@/lib/utils/helpers';
import { ROTATION_UNITS } from '@/lib/constants/rotations';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Panel } from '@/components/common/Panel';
import { IRotationUnit, IUnitRestDays } from '@/lib/types/rotation';
import clsx from 'clsx';

const ROTATION_COLORS: { [key: string]: string } = {
  A1: 'bg-red-100 border-red-300',
  A2: 'bg-red-200 border-red-400',
  A3: 'bg-red-300 border-red-500',
  A4: 'bg-red-400 border-red-600',
  B1: 'bg-blue-100 border-blue-300',
  B2: 'bg-blue-200 border-blue-400',
  B3: 'bg-blue-300 border-blue-500',
  B4: 'bg-blue-400 border-blue-600',
  C1: 'bg-green-100 border-green-300',
  C2: 'bg-green-200 border-green-400',
  C3: 'bg-green-300 border-green-500',
  C4: 'bg-green-400 border-green-600',
};

export function SimuladorRotacion() {
  const { config } = useConfigStore();
  const {
    rotationSequence,
    currentStep,
    isPlaying,
    playbackSpeed,
    setStep,
    togglePlayback,
    setPlaybackSpeed,
  } = useRotationStore();

  const [rotationStats, setRotationStats] = useState<IUnitRestDays[] | null>(null);
  const [fairnessScore, setFairnessScore] = useState(0);

  // Generate rotation sequence and calculate stats
  useEffect(() => {
    const startDate = new Date();
    const endDate = new Date(startDate.getFullYear() + (config.proyeccionAnos || 2), 11, 31);

    const sequence = generateRotationSequence(
      startDate,
      endDate,
      rotationSequence || ROTATION_UNITS.map(u => u.id)
    );

    // Calculate stats for each unit
    const stats: IUnitRestDays[] = [];
    const rotationUnitIds = rotationSequence || ROTATION_UNITS.map(u => u.id);

    rotationUnitIds.forEach(unitId => {
      const restDays = getRestDaysForUnit(unitId, sequence, config);
      stats.push(restDays);
    });

    setRotationStats(stats);

    // Calculate fairness score (variance-based)
    if (stats.length > 0) {
      const scores = stats.map(stat => (stat.daysOn > 0 ? stat.daysOff / stat.daysOn : 0));
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
      const fairness = Math.max(0, 100 - Math.sqrt(variance) * 100);
      setFairnessScore(fairness);
    }
  }, [config, rotationSequence]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStep((prev) => {
        const nextStep = prev + 1;
        return nextStep >= 52 ? 0 : nextStep;
      });
    }, (2000 / playbackSpeed) as number);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, setStep]);

  const currentUnit = (rotationSequence || ROTATION_UNITS.map(u => u.id))[currentStep % 12] || 'N/A';
  const unitColor = ROTATION_COLORS[currentUnit] || 'bg-gray-100 border-gray-300';

  const handleExportRotation = () => {
    if (!rotationSequence) return;

    const csv = [
      ['Paso', 'Unidad', 'Grupo', 'Sub-Grupo'].join(','),
      ...rotationSequence.map((unit, idx) => {
        const rotation = ROTATION_UNITS.find(r => r.id === unit);
        return [
          idx + 1,
          rotation?.id,
          rotation?.group,
          rotation?.sub,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rotacion-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Main Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Unit Display */}
        <div className="lg:col-span-2">
          <Card padding="lg" className={clsx('flex flex-col items-center justify-center h-64 border-4', unitColor)}>
            <div className="text-6xl font-black mb-4">
              {(() => {
                const group = currentUnit.charAt(0);
                return group === 'A' ? '🔴' : group === 'B' ? '🔵' : '🟢';
              })()}
            </div>
            <h1 className="text-6xl font-black text-gray-900 mb-2">{currentUnit}</h1>
            <p className="text-xl text-gray-700">
              Periodo {Math.floor(currentStep / 4) + 1} de 13
            </p>
            <p className="text-sm text-gray-600 mt-2">Semana {currentStep + 1}</p>
          </Card>

          {/* Playback Controls */}
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                variant={isPlaying ? 'danger' : 'primary'}
                size="md"
                onClick={() => togglePlayback()}
              >
                {isPlaying ? '⏸️ Pausa' : '▶️ Reproducir'}
              </Button>
              <Button variant="outline" size="md" onClick={() => setStep(0)}>
                🔄 Reiniciar
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                ⏮️ Atrás
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setStep(Math.min(51, currentStep + 1))}
                disabled={currentStep === 51}
              >
                ⏭️ Adelante
              </Button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-bold text-gray-700">Velocidad:</span>
              {[0.5, 1, 2].map(speed => (
                <Button
                  key={speed}
                  variant={playbackSpeed === speed ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPlaybackSpeed(speed)}
                >
                  {speed}x
                </Button>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / 52) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 text-center">
              Semana {currentStep + 1} / 52
            </p>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          <Panel title="📊 Estadísticas" color="info" collapsible={true}>
            <div className="space-y-3">
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <p className="text-xs text-gray-600 font-bold uppercase mb-1">Equidad Rotacional</p>
                <p className="text-2xl font-black text-purple-900">{fairnessScore.toFixed(1)}%</p>
                <p className="text-xs text-purple-600 mt-1">
                  {fairnessScore > 80
                    ? '✅ Excelente distribución'
                    : fairnessScore > 60
                      ? '⚠️ Buena distribución'
                      : '❌ Requiere rebalanceo'}
                </p>
              </div>

              {rotationStats && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <p className="text-xs font-bold text-gray-700 uppercase">Unidades</p>
                  {rotationStats.slice(0, 12).map(stat => (
                    <div
                      key={stat.unitId}
                      className={clsx('p-2 rounded border text-xs', ROTATION_COLORS[stat.unitId] || 'bg-gray-100')}
                    >
                      <div className="flex justify-between font-bold">
                        <span>{stat.unitId}</span>
                        <span>{stat.daysOn}d</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-700">
                        <span>Descanso:</span>
                        <span>{stat.daysOff}d</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          {/* Export Button */}
          <Button variant="primary" size="md" className="w-full" onClick={handleExportRotation}>
            📥 Exportar CSV
          </Button>
        </div>
      </div>

      {/* Sequence Overview */}
      <Panel title="🔄 Secuencia Completa (13 Períodos)" color="default" collapsible={true}>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-13 gap-2">
          {(rotationSequence || ROTATION_UNITS.map(u => u.id)).map((unit, idx) => (
            <button
              key={`${unit}-${idx}`}
              onClick={() => setStep(idx)}
              className={clsx(
                'aspect-square rounded font-bold text-sm flex items-center justify-center transition-all border-2',
                ROTATION_COLORS[unit] || 'bg-gray-100',
                idx === currentStep % 12 ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg' : '',
                'hover:shadow-md'
              )}
              title={`Período ${Math.floor(idx / 4) + 1} - ${unit}`}
            >
              {unit}
            </button>
          ))}
        </div>
      </Panel>

      {/* Timeline visualization */}
      <Panel title="📅 Línea de Tiempo (52 Semanas)" color="default" collapsible={true}>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, periodIdx) => (
            <div key={periodIdx}>
              <p className="text-xs font-bold text-gray-700 mb-2">Período {periodIdx + 1}</p>
              <div className="grid grid-cols-13 gap-1">
                {Array.from({ length: 13 }).map((_, unitIdx) => {
                  const weekIdx = periodIdx * 13 + unitIdx;
                  const unit = (rotationSequence || ROTATION_UNITS.map(u => u.id))[weekIdx % 12];

                  return (
                    <button
                      key={`week-${weekIdx}`}
                      onClick={() => setStep(weekIdx)}
                      className={clsx(
                        'h-8 rounded border text-[10px] font-bold flex items-center justify-center transition-all',
                        ROTATION_COLORS[unit] || 'bg-gray-100',
                        weekIdx === currentStep ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                      )}
                      title={`Semana ${weekIdx + 1}: ${unit}`}
                    >
                      {weekIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
