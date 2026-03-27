/**
 * Tipos de Rotación
 * Define estructuras para unidades, secuencias, calendario de rotación
 */

export type RotationGroup = 'A' | 'B' | 'C'
export type RotationSub = 1 | 2 | 3 | 4

/**
 * Una unidad de rotación (ej: A1, B3, C2)
 */
export interface IRotationUnit {
  group: RotationGroup
  sub: RotationSub
  id: string // Formato: "A1", "B3", etc.
  displayName: string
  color?: string // Para visualización
}

/**
 * Posición en la secuencia de rotación
 */
export interface IRotationSequenceItem {
  position: number // Índice en la secuencia
  unit: IRotationUnit
  startDate: Date
  endDate: Date
  daysAssigned: number
  restDays: number
  rotation: number // Número de rotación (13 días, etc.)
}

/**
 * Información de descanso de una unidad
 */
export interface IUnitRestDays {
  unit: IRotationUnit
  startDate: Date
  endDate: Date
  restDays: Date[] // Días de descanso
  workDays: Date[] // Días trabajados
  schedule: 'A1->B1->C1->A2...' | 'custom' // Patrón
  daysOff: number
  daysOn: number
}

/**
 * Visualización de la secuencia de rotación
 */
export interface IRotationVisualization {
  title: string
  baseSequence: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13)[] // [1,13,2,12,...]
  currentSequence: IRotationUnit[] // [A1, B1, C1, A2, ...]
  unitCount: number // 12
  cycleLength: number // 13 períodos
  
  // Estado de animación
  currentStep?: number
  isPlaying?: boolean
  speed?: number // 0.5x, 1x, 2x
}

/**
 * Datos de exportación de rotación
 */
export interface IRotationExport {
  format: 'excel' | 'image' | 'pdf' | 'json'
  data: IRotationVisualization
  filename: string
  timestamp: string
}

/**
 * Cálculo de rotación para un período
 */
export interface IRotationCalculation {
  startDate: Date
  endDate: Date
  baseSequence: number[]
  customSequence: IRotationUnit[]
  
  // Resultados por unidad
  unitAssignments: Record<string, IUnitRestDays>
  
  // Métricas
  totalDays: number
  averageRestDays: number
  fairnessScore: number // 0-100, mide equidad
  
  // Años proyectados
  yearsCovered: number
}

/**
 * Importación de DNEs (lista de empleados)
 */
export interface IDNEImport {
  filename: string
  dneList: string[]
  count: number
  importedAt: string
  
  // Para validación
  validDNEs: string[]
  invalidDNEs: string[]
  isValid: boolean
}

/**
 * Información agregada de rotación
 */
export interface IRotationAggregated {
  totalUnits: number
  groupCounts: Record<RotationGroup, number> // A: 4, B: 4, C: 4
  cycleLength: number
  baseSequence: number[]
  projectionYears: number
}
