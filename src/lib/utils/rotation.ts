/**
 * Funciones de Rotación
 * Lógica para calcular rotaciones, secuencias, descansos
 */

import { IConfig } from '@/lib/types/config'
import { IRotationUnit, IRotationSequenceItem, IUnitRestDays } from '@/lib/types/rotation'
import { ROTATION_GROUPS, ROTATION_UNITS, ROTATION_BASE_SEQUENCE, ROTATION_CYCLE_LENGTH } from '@/lib/constants/rotations'
import { addDays, getDaysInRange, getISOWeek } from './helpers'

/**
 * Crea una unidad de rotación
 */
export const createRotationUnit = (group: string, sub: number): IRotationUnit => {
  return {
    group: group as 'A' | 'B' | 'C',
    sub: sub as 1 | 2 | 3 | 4,
    id: `${group}${sub}`,
    displayName: `${group}${sub}`,
    color: getRotationUnitColor(`${group}${sub}`),
  }
}

/**
 * Obtiene el color de una unidad
 */
const getRotationUnitColor = (unitId: string): string => {
  const colors: Record<string, string> = {
    A1: '#FF6B6B',
    A2: '#FF8E72',
    A3: '#FFA94D',
    A4: '#FFD43B',
    B1: '#4ECDC4',
    B2: '#45B7D1',
    B3: '#38A9B8',
    B4: '#2B96A0',
    C1: '#A78BFA',
    C2: '#C4B5FD',
    C3: '#DDD6FE',
    C4: '#E9D5FF',
  }
  return colors[unitId] || '#9CA3AF'
}

/**
 * Obtiene la unidad de rotación para una fecha
 */
export const getRotationUnitForDate = (
  date: Date,
  sequence: string[],
  startDate: Date,
  cycleLength: number = 13
): string | null => {
  const diffMs = date.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const blockIndex = Math.floor(diffDays / cycleLength)
  const unitIndex = blockIndex % sequence.length

  return sequence[unitIndex] || null
}

/**
 * Calcula la secuencia de rotación completa para un período
 */
export const generateRotationSequence = (
  startDate: Date,
  endDate: Date,
  unitSequence: string[],
  cycleLength: number = 13
): IRotationSequenceItem[] => {
  const items: IRotationSequenceItem[] = []
  const days = getDaysInRange(startDate, endDate)
  const blockMap = new Map<number, IRotationSequenceItem>()

  let position = 0

  days.forEach(day => {
    const diffMs = day.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const blockIndex = Math.floor(diffDays / cycleLength)
    const unitIndex = blockIndex % unitSequence.length
    const unitId = unitSequence[unitIndex]

    if (!blockMap.has(blockIndex)) {
      const blockStartDate = new Date(startDate)
      blockStartDate.setDate(blockStartDate.getDate() + blockIndex * cycleLength)
      const blockEndDate = new Date(blockStartDate)
      blockEndDate.setDate(blockEndDate.getDate() + cycleLength - 1)

      blockMap.set(blockIndex, {
        position: position++,
        unit: createRotationUnit(unitId[0], parseInt(unitId[1], 10)),
        startDate: blockStartDate,
        endDate: blockEndDate,
        daysAssigned: 0,
        restDays: 0,
        rotation: blockIndex + 1,
      })
    }

    const block = blockMap.get(blockIndex)
    if (block) {
      block.daysAssigned++
    }
  })

  return Array.from(blockMap.values())
}

/**
 * Calcula los días de descanso para una unidad en un período
 */
export const getRestDaysForUnit = (
  unitId: string,
  startDate: Date,
  endDate: Date,
  unitSequence: string[],
  cycleLength: number = 13
): Date[] => {
  const restDays: Date[] = []
  const days = getDaysInRange(startDate, endDate)

  days.forEach(day => {
    const unit = getRotationUnitForDate(day, unitSequence, startDate, cycleLength)
    if (unit === unitId) {
      restDays.push(new Date(day))
    }
  })

  return restDays
}

/**
 * Calcula métricas de rotación para una unidad
 */
export const calculateUnitRotationMetrics = (
  unitId: string,
  sequence: string[],
  startDate: Date,
  endDate: Date,
  cycleLength: number = 13
): IUnitRestDays => {
  const restDays = getRestDaysForUnit(unitId, startDate, endDate, sequence, cycleLength)

  // Los días no de descanso son días trabajados
  const totalDays = getDaysInRange(startDate, endDate).length
  const workDays = getDaysInRange(startDate, endDate).filter(d => {
    const unit = getRotationUnitForDate(d, sequence, startDate, cycleLength)
    return unit !== unitId
  })

  return {
    unit: createRotationUnit(unitId[0], parseInt(unitId[1], 10)),
    startDate,
    endDate,
    restDays,
    workDays,
    schedule: 'A1->B1->C1->A2...',
    daysOff: restDays.length,
    daysOn: workDays.length,
  }
}

/**
 * Reordena la secuencia de unidades
 */
export const moveRotationUnit = (sequence: string[], fromIndex: number, toIndex: number): string[] => {
  const newSequence = [...sequence]
  const [unit] = newSequence.splice(fromIndex, 1)
  newSequence.splice(toIndex, 0, unit)
  return newSequence
}

/**
 * Resetea la secuencia de rotación a valores por defecto
 */
export const resetRotationUnitSequence = (): string[] => {
  return ['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3', 'A4', 'B4', 'C4']
}

/**
 * Valida una secuencia de rotación
 */
export const isValidRotationSequence = (sequence: string[]): boolean => {
  if (sequence.length !== 12) return false
  if (new Set(sequence).size !== 12) return false // Duplicados
  return sequence.every(unit => ROTATION_UNITS.includes(unit))
}

/**
 * Calcula equidad de rotación (0-100)
 */
export const calculateFairnessScore = (metrics: Map<string, IUnitRestDays>): number => {
  const daysOffArray = Array.from(metrics.values()).map(m => m.daysOff)

  if (daysOffArray.length === 0) return 100

  const average = daysOffArray.reduce((a, b) => a + b, 0) / daysOffArray.length
  const variance = daysOffArray.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / daysOffArray.length
  const stdDev = Math.sqrt(variance)

  // Convertir a puntuación (100 = perfecta equidad)
  const maxStdDev = average * 0.3 // Permiso de 30% variación
  const score = Math.max(0, 100 - (stdDev / maxStdDev) * 100)

  return Math.round(score)
}

/**
 * Obtiene estadísticas de rotación
 */
export const getRotationStats = (sequence: string[], days: number): Record<string, number> => {
  const stats: Record<string, number> = {}
  const cycleLength = 13

  sequence.forEach(unit => {
    const occurrences = Math.ceil(days / (sequence.length * cycleLength))
    stats[unit] = occurrences * cycleLength
  })

  return stats
}
