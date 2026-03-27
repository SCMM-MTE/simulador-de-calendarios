/**
 * Tipos de Calendario y Simulación
 * Define estructuras para días, cuotas, resultados
 */

import { DayType, PressureLevel } from './config'

/**
 * Información de un día en el calendario
 */
export interface IDayEntry {
  date: Date
  dayOfWeek: number // 0=domingo, 1=lunes, ..., 6=sábado
  week: number // Semana del año (1-53)
  month: number // Mes (0-11)
  year: number
  dayType: DayType
  assigned?: string // Unidad asignada (A1, B2, C3, etc.)
  pressure?: PressureLevel // Factor de presión
  quota?: number // Cuota disponible
  flex?: number // Créditos flex
  pap?: boolean // Es día de PAP
  vacation?: boolean // Período de vacación
  holiday?: boolean // Festivo
  notes?: string
}

/**
 * Información de cuota mensual
 */
export interface IMonthlyQuota {
  month: number // 0-11 or 0-12 para junio
  laboral: number // Cuota días laborales
  sabadoDomingo: number // Cuota sábado+domingo
  festivos: number // Cuota festivos
  pesoC: number // Peso (C) para ordenamiento
  autoPriorityA: number // Prioridad auto (A)
}

/**
 * Información de vacación/descanso
 */
export interface IVacationRange {
  startDate: Date
  endDate: Date
  type: 'vacation' | 'rest' | 'pap' | 'custom'
  description?: string
  unit?: string // Unidad afectada (A1, B2, etc.)
}

/**
 * Resultado de simulación de calendario
 */
export interface ISimulatorResult {
  calendarType: CalendarType
  configId: string
  startDate: Date
  endDate: Date
  
  // Datos generados
  days: IDayEntry[]
  monthlyQuotas: IMonthlyQuota[]
  vacationRanges: IVacationRange[]
  
  // Estadísticas
  totalDays: number
  assignedDays: number
  availableDays: number
  utilizationRate: number // 0-1
  
  // Metadata
  createdAt: string
  calculationTime: number // ms
  mteTotal: number
  groupDistribution: Record<string, number> // A: 100, B: 105, C: 110
}

/**
 * Comparación de escenarios
 */
export interface IScenarioComparison {
  scenarioA: ISimulatorResult
  scenarioB: ISimulatorResult
  
  differences: {
    totalDaysDiff: number
    assignedDaysDiff: number
    utilizationDiff: number
  }
  
  winning?: 'A' | 'B' | 'tie'
  analysis: string
}

/**
 * Datos para visualización en gráficos
 */
export interface IChartData {
  name: string
  value: number
  percentage: number
  color?: string
}

/**
 * Análisis de período
 */
export interface IPeriodAnalysis {
  startDate: Date
  endDate: Date
  period: 'week' | 'month' | 'quarter' | 'year'
  
  metrics: {
    totalDays: number
    workDays: number
    holidays: number
    vacations: number
    assignments: number
  }
  
  distribution: Record<string, number> // Por grupo
  pressure: Record<string, PressureLevel> // Por tipo
}

export type CalendarType = 'A' | 'B' | 'C'
