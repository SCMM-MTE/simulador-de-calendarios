'use client';

import { useRef, useState } from 'react';
import { useConfigStore } from '@/store/configStore';
import { MESES, AUTO_A_PROFILE_SEGMENTS } from '@/lib/constants/seasons';
import { ROTATION_UNITS } from '@/lib/constants/rotations';
import { validateConfig } from '@/lib/utils/validation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { Panel } from '@/components/common/Panel';
import { IConfig } from '@/lib/types/config';
import clsx from 'clsx';
import * as XLSX from 'xlsx';

export function Ajustes() {
  const {
    config,
    updateConfigField,
    setConfig,
    resetConfig,
  } = useConfigStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rotationUnitSequence, setRotationUnitSequence] = useState(
    (config.rotationUnitSequence || []).length > 0
      ? config.rotationUnitSequence
      : [...ROTATION_UNITS]
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleChange = (field: keyof IConfig, value: any) => {
    updateConfigField(field, value);
    setValidationErrors([]);
  };

  const toPressureLevel = (value: number) => {
    return ((value || 10) / 10).toFixed(1);
  };

  const fromPressureLevel = (value: string) => {
    return Math.round(parseFloat(value) * 10);
  };

  const handlePressureLevelChange = (field: string, value: string) => {
    const numValue = fromPressureLevel(value);
    updateConfigField(field as keyof IConfig, numValue);
  };

  const handleRotationExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<{ [key: string]: string }>(worksheet, {
        header: 1,
      }) as string[][];

      const dneList = data
        .map(row => (typeof row[0] === 'string' ? row[0].trim() : ''))
        .filter(val => val.length > 0 && val.match(/^\d+$/));

      if (dneList.length === 0) {
        setValidationErrors(['No se encontraron DNEs válidos en el archivo']);
        return;
      }

      updateConfigField('rotationDneList', dneList);
      updateConfigField('rotationDneFileName', file.name);
      updateConfigField('globalMTE', dneList.length);

      setValidationErrors([]);
    } catch (error) {
      setValidationErrors([`Error al leer Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearRotationExcel = () => {
    updateConfigField('rotationDneList', []);
    updateConfigField('rotationDneFileName', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const moveRotationUnit = (fromIndex: number, direction: -1 | 1) => {
    const newSequence = [...rotationUnitSequence];
    const toIndex = fromIndex + direction;
    if (toIndex >= 0 && toIndex < newSequence.length) {
      [newSequence[fromIndex], newSequence[toIndex]] = [newSequence[toIndex], newSequence[fromIndex]];
      setRotationUnitSequence(newSequence);
      updateConfigField('rotationUnitSequence', newSequence);
    }
  };

  const resetRotationUnitSequence = () => {
    const defaultSequence = ROTATION_UNITS.map(u => u.id);
    setRotationUnitSequence(defaultSequence);
    updateConfigField('rotationUnitSequence', defaultSequence);
  };

  const applyAutoProfileDefaults = () => {
    const defaultProfile: { [key: string]: number } = {};
    AUTO_A_PROFILE_SEGMENTS.forEach(seg => {
      defaultProfile[seg.configKey] = seg.defaultWeight;
    });
    
    const updatedConfig = { ...config, ...defaultProfile };
    setConfig(updatedConfig);
  };

  const handleSaveConfig = async () => {
    const validation = validateConfig(config);
    if (validation.errors.length > 0) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      await apiClient.saveConfig(config);
      setValidationErrors([]);
    } catch (error) {
      setValidationErrors([
        `Error al guardar configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      ]);
    }
  };

  const handleResetConfig = () => {
    resetConfig();
    resetRotationUnitSequence();
    setShowResetConfirm(false);
    setValidationErrors([]);
  };

  const capitalizeMonth = (month: number): string => {
    const m = MESES[month] || '';
    return m.charAt(0).toUpperCase() + m.slice(1);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">⚙️ Ajustes</h1>
          <p className="text-gray-600">Configura parámetros generales, presión, festivos y cupos PAP</p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card variant="bordered" padding="md" className="mb-6 border-red-300 bg-red-50">
            <div className="space-y-2">
              {validationErrors.map((error, idx) => (
                <p key={idx} className="text-sm text-red-700">
                  ❌ {error}
                </p>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - General Settings */}
          <div className="flex flex-col gap-4">
            {/* Global MTE */}
            <Panel title="👥 Datos Generales" color="info" collapsible={false}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-2 uppercase">
                    Plantilla MTE Total
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold text-lg text-blue-700"
                    value={config.globalMTE}
                    onChange={e => handleChange('globalMTE', parseInt(e.target.value) || 2100)}
                  />
                </div>

                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <label className="text-xs font-bold text-purple-800 block mb-1 uppercase">
                    Capacidad Cal. C (Por Grupo)
                  </label>
                  <div className="text-xl font-black text-purple-900">
                    {Math.max(1, Math.round((config.globalMTE || 2100) / 52))} plazas
                  </div>
                  <p className="text-xs text-purple-600 mt-1 leading-tight">
                    Fórmula: MTE / 4 Grupos / 13 Periodos
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-2 uppercase">
                    Máx. Solapamiento (Días)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={config.maxSolapamiento}
                    onChange={e => handleChange('maxSolapamiento', parseInt(e.target.value) || 3)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-2 uppercase">
                    Créditos Auto por MTE (Cal. A)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={config.creditosAutoA ?? 150}
                    onChange={e => handleChange('creditosAutoA', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </Panel>

            {/* Rotation DNE Import */}
            <Panel title="📥 Sorteo Rotación" color="default" collapsible={false}>
              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Sube un Excel con <b>una sola columna</b> y <b>un DNE por fila</b>. Ajustará automáticamente
                  el MTE total.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleRotationExcelImport}
                />

                <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-600 uppercase">Fichero actual</span>
                    <span className="font-bold text-gray-800">
                      {config.rotationDneFileName || 'Sin cargar'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-600 uppercase">DNE leídos</span>
                    <span className="font-bold text-blue-700">
                      {Array.isArray(config.rotationDneList) ? config.rotationDneList.length : 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-600 uppercase">Plantilla MTE</span>
                    <span className="font-bold text-purple-700">{config.globalMTE}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Subir Excel DNE
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={!Array.isArray(config.rotationDneList) || config.rotationDneList.length === 0}
                    onClick={clearRotationExcel}
                  >
                    Limpiar
                  </Button>
                </div>

                {/* Rotation Unit Sequence */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">
                      Secuencia unidades del sorteo
                    </label>
                    <Button variant="outline" size="sm" onClick={resetRotationUnitSequence}>
                      Restaurar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Orden default: A1 → B1 → C1 → A2... Puedes reordenar.
                  </p>
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {rotationUnitSequence.map((unit, idx) => (
                      <div
                        key={`${unit}-${idx}`}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded px-2 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center text-xs font-bold text-gray-500">{idx + 1}</span>
                          <span className="text-xs font-bold text-gray-800">{unit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant={idx === 0 ? 'secondary' : 'outline'}
                            size="sm"
                            disabled={idx === 0}
                            onClick={() => moveRotationUnit(idx, -1)}
                          >
                            ↑
                          </Button>
                          <Button
                            variant={idx === rotationUnitSequence.length - 1 ? 'secondary' : 'outline'}
                            size="sm"
                            disabled={idx === rotationUnitSequence.length - 1}
                            onClick={() => moveRotationUnit(idx, 1)}
                          >
                            ↓
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            {/* Pressure Levels */}
            <Panel title="🌡️ Nivel de Presión (Cal. A)" color="default" collapsible={true}>
              <div className="space-y-2">
                {[
                  { key: 'presionLab', label: 'Lab. Normales' },
                  { key: 'presionSD', label: 'F.S. Normales' },
                  { key: 'presionFes', label: 'Festivos' },
                  { key: 'presionAltaLab', label: 'Lab. Verano (Jun-Sep)', color: 'red' },
                  { key: 'presionAltaSD', label: 'F.S. Verano', color: 'red' },
                  { key: 'presionInviernoLab', label: 'Lab. Invierno', color: 'cyan' },
                  { key: 'presionInviernoSD', label: 'F.S. Invierno', color: 'cyan' },
                  { key: 'presionSemanaSanta', label: 'Semana Santa', color: 'violet' },
                  { key: 'presionPuentes', label: 'Puentes', color: 'amber' },
                  { key: 'presionViernes', label: 'Viernes', color: 'sky' },
                  { key: 'presionMartes', label: 'Martes', color: 'indigo' },
                ].map(({ key, label, color }) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <label className={clsx('text-xs font-bold', {
                      'text-gray-700': !color,
                      'text-red-700': color === 'red',
                      'text-cyan-700': color === 'cyan',
                      'text-violet-700': color === 'violet',
                      'text-amber-700': color === 'amber',
                      'text-sky-700': color === 'sky',
                      'text-indigo-700': color === 'indigo',
                    })}>
                      {label}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className={clsx('w-20 px-2 py-1 border rounded text-right text-xs font-bold', {
                          'border-gray-300': !color,
                          'border-red-300': color === 'red',
                          'border-cyan-300': color === 'cyan',
                          'border-violet-300': color === 'violet',
                          'border-amber-300': color === 'amber',
                          'border-sky-300': color === 'sky',
                          'border-indigo-300': color === 'indigo',
                        })}
                        value={toPressureLevel(config[key as keyof IConfig] as number)}
                        onChange={e => handlePressureLevelChange(key, e.target.value)}
                      />
                      <span className="text-xs font-bold text-gray-600">Niv.</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Parameters & Holidays */}
            <Panel title="🧠 Parámetros Lógicos" color="default" collapsible={true}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2 uppercase">
                    Años Proyección (Rotación)
                  </label>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    value={config.proyeccionAnos || 2}
                    onChange={e => handleChange('proyeccionAnos', parseInt(e.target.value) || 2)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2 uppercase">
                    Festivos Locales (Mes-Día)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(config.customHolidays || []).map((h, i) => {
                      const [m, d] = h.split('-');
                      return (
                        <span
                          key={i}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold flex items-center gap-1"
                        >
                          {parseInt(d)}/{parseInt(m) + 1}
                          <button
                            onClick={() =>
                              handleChange(
                                'customHolidays',
                                config.customHolidays?.filter((_, idx) => idx !== i)
                              )
                            }
                            className="text-blue-500 hover:text-red-500 ml-1 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <select
                      id="newHolMonth"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      {MESES.map((m, i) => (
                        <option key={i} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      id="newHolDay"
                      placeholder="Día"
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                      min="1"
                      max="31"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const dayEl = document.getElementById('newHolDay') as HTMLInputElement;
                        const monthEl = document.getElementById('newHolMonth') as HTMLSelectElement;
                        const d = dayEl?.value;
                        const m = monthEl?.value;
                        if (d && m) {
                          handleChange('customHolidays', [
                            ...(config.customHolidays || []),
                            `${m}-${d}`,
                          ]);
                          dayEl.value = '';
                        }
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* RIGHT COLUMN - PAP & Auto Profile */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Auto Profile */}
            <Panel title="🎯 Preferencia Auto Simplificada (Cal. A)" color="default" collapsible={true}>
              <div className="space-y-4">
                <p className="text-xs text-gray-600">
                  5 tramos estacionales con el mismo valor para todos los meses de cada tramo.
                </p>
                <Button variant="outline" size="sm" onClick={applyAutoProfileDefaults}>
                  Restaurar perfil base
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {AUTO_A_PROFILE_SEGMENTS.map(segment => (
                    <div key={segment.configKey} className="border border-gray-200 rounded p-3 bg-white">
                      <label className="text-xs font-bold text-gray-700 block mb-2 uppercase leading-tight">
                        {segment.name}
                      </label>
                      <p className="text-xs text-gray-500 mb-2">{segment.months}</p>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center font-bold"
                        value={config[segment.configKey as keyof IConfig] as number}
                        onChange={e =>
                          handleChange(segment.configKey as keyof IConfig, parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            {/* PAP Configuration */}
            <Panel title="🧩 Gestión de PAP" color="default" collapsible={true}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2 uppercase">
                    Días PAP por MTE
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-center font-bold text-teal-700"
                    value={config.maxPAPGlobal || 0}
                    onChange={e => handleChange('maxPAPGlobal', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="bg-teal-50 p-3 rounded border border-teal-100">
                  <h4 className="text-xs font-bold text-teal-900 uppercase mb-3">Motor de Asignación Automática</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 font-medium">Habilitar IA Asignación</span>
                      <button
                        onClick={() => handleChange('autoAssignPAP', config.autoAssignPAP ? 0 : 1)}
                        className={clsx(
                          'px-3 py-1 rounded text-xs font-bold text-white',
                          config.autoAssignPAP ? 'bg-teal-500' : 'bg-gray-300'
                        )}
                      >
                        {config.autoAssignPAP ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 font-medium">Prioridad vs Vacaciones</span>
                      <input
                        type="number"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                        value={config.prioridadPAP || 50}
                        onChange={e => handleChange('prioridadPAP', parseInt(e.target.value) || 50)}
                        disabled={!config.autoAssignPAP}
                      />
                    </div>
                  </div>
                </div>

                {/* PAP Quota Table */}
                <div className="bg-white border border-gray-200 rounded p-3 overflow-x-auto">
                  <h4 className="text-xs font-bold text-gray-900 uppercase mb-3">
                    Cupos PAP por Temporada (Lab / Sáb / Dom)
                  </h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-600 uppercase border-b border-gray-200">
                        <th className="text-left py-1 pr-2 font-bold">Temporada</th>
                        <th className="text-center py-1 px-1 font-bold">Lab</th>
                        <th className="text-center py-1 px-1 font-bold">Sáb</th>
                        <th className="text-center py-1 px-1 font-bold">Dom</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {[
                        { season: 'Invierno', lab: 'pap_invierno_lab', sab: 'pap_invierno_sab', dom: 'pap_invierno_dom' },
                        { season: 'Jun Q2 (16-30)', lab: 'pap_junioQ2_lab', sab: 'pap_junioQ2_sab', dom: 'pap_junioQ2_dom' },
                        { season: 'Julio', lab: 'pap_julio_lab', sab: 'pap_julio_sab', dom: 'pap_julio_dom' },
                        { season: 'Agosto', lab: 'pap_agosto_lab', sab: 'pap_agosto_sab', dom: 'pap_agosto_dom' },
                        { season: 'Septiembre', lab: 'pap_septiembre_lab', sab: 'pap_septiembre_sab', dom: 'pap_septiembre_dom' },
                      ].map((row) => (
                        <tr key={row.season} className="border-b border-gray-100">
                          <td className="py-2 pr-2 font-bold">{row.season}</td>
                          <td className="px-1">
                            <input
                              type="number"
                              min="0"
                              className="w-full px-1 py-0.5 border border-gray-300 rounded text-center text-xs"
                              value={config[row.lab as keyof IConfig] as number}
                              onChange={e =>
                                handleChange(row.lab as keyof IConfig, parseInt(e.target.value) || 0)
                              }
                            />
                          </td>
                          <td className="px-1">
                            <input
                              type="number"
                              min="0"
                              className="w-full px-1 py-0.5 border border-gray-300 rounded text-center text-xs"
                              value={config[row.sab as keyof IConfig] as number}
                              onChange={e =>
                                handleChange(row.sab as keyof IConfig, parseInt(e.target.value) || 0)
                              }
                            />
                          </td>
                          <td className="px-1">
                            <input
                              type="number"
                              min="0"
                              className="w-full px-1 py-0.5 border border-gray-300 rounded text-center text-xs"
                              value={config[row.dom as keyof IConfig] as number}
                              onChange={e =>
                                handleChange(row.dom as keyof IConfig, parseInt(e.target.value) || 0)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex gap-3 justify-center">
          <Button variant="primary" size="lg" onClick={handleSaveConfig}>
            💾 Guardar Configuración
          </Button>
          <Button variant="danger" size="lg" onClick={() => setShowResetConfirm(true)}>
            🔄 Restaurar Defaults
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        size="sm"
      >
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">¿Restaurar configuración?</h2>
          <p className="text-gray-600">
            Esto eliminará todos los cambios actuales y restaurará los valores por defecto. No se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleResetConfig}>
              Restaurar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
