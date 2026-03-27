'use client';

import { useState, useEffect } from 'react';
import { useConfigStore } from '@/store/configStore';
import {
  Ajustes,
  SimuladorCalendario,
  SimuladorRotacion,
  SimuladorAnalisis,
} from '@/components/features';
import clsx from 'clsx';

type TabType = 'ajustes' | 'cal-a' | 'cal-b' | 'cal-c' | 'rotacion' | 'analisis';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('ajustes');
  const { loadConfigFromStorage } = useConfigStore();

  // Load config from storage on mount
  useEffect(() => {
    loadConfigFromStorage();
  }, [loadConfigFromStorage]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
    { id: 'cal-a', label: 'Cal. A', icon: '📅' },
    { id: 'cal-b', label: 'Cal. B', icon: '📅' },
    { id: 'cal-c', label: 'Cal. C', icon: '📅' },
    { id: 'rotacion', label: 'Rotación', icon: '🔄' },
    { id: 'analisis', label: 'Análisis', icon: '📊' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-black text-gray-900">📅 SCMM Simulador Calendarios</h1>
          <p className="text-gray-600 text-sm mt-1">
            Simulación de calendarios laborales, rotaciones y análisis de presión
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={clsx(
                  'px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ajustes */}
        {activeTab === 'ajustes' && (
          <div role="tabpanel">
            <Ajustes />
          </div>
        )}

        {/* Calendarios A, B, C */}
        {activeTab === 'cal-a' && (
          <div role="tabpanel">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-gray-900">📅 Calendario A</h2>
              <p className="text-gray-600 text-sm mt-1">
                Distribución de días laborales, festivos y presión acumulada
              </p>
            </div>
            <SimuladorCalendario calendarType="A" />
          </div>
        )}

        {activeTab === 'cal-b' && (
          <div role="tabpanel">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-gray-900">📅 Calendario B</h2>
              <p className="text-gray-600 text-sm mt-1">
                Distribución de días laborales, festivos y presión acumulada
              </p>
            </div>
            <SimuladorCalendario calendarType="B" />
          </div>
        )}

        {activeTab === 'cal-c' && (
          <div role="tabpanel">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-gray-900">📅 Calendario C</h2>
              <p className="text-gray-600 text-sm mt-1">
                Distribución de días laborales, festivos y presión acumulada
              </p>
            </div>
            <SimuladorCalendario calendarType="C" />
          </div>
        )}

        {/* Rotación */}
        {activeTab === 'rotacion' && (
          <div role="tabpanel">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-gray-900">🔄 Simulador Rotación</h2>
              <p className="text-gray-600 text-sm mt-1">
                Visualización y control de la secuencia de rotación de unidades
              </p>
            </div>
            <SimuladorRotacion />
          </div>
        )}

        {/* Análisis */}
        {activeTab === 'analisis' && (
          <div role="tabpanel">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-gray-900">📊 Análisis Comparativo</h2>
              <p className="text-gray-600 text-sm mt-1">
                Comparativa entre escenarios y distribuciones por tipo de día
              </p>
            </div>
            <SimuladorAnalisis />
          </div>
        )}
      </div>
    </main>
  );
}
