/**
 * Funciones de cálculo de Calendario
 * Determina categorías de días, presión, cuotas, etc.
 */

import { IConfig } from '@/lib/types/config'
import { IDayEntry, IMonthlyQuota } from '@/lib/types/calendar'
import {
  isSaturday,
  isSunday,
  isWeekend,
  getDayOfWeek,
  getISOWeek,
  isDateInRange,
  formatDate,
} from './helpers'
import { isEasterRelatedHoliday, getEasterRelatedHolidays } from './easter'
import { FIXED_HOLIDAYS, MESES, AUTO_A_PROFILE_SEGMENTS } from '@/lib/constants/seasons'
import { DEFAULT_PRESSURE_LEVELS } from '@/lib/constants/defaults'

/**
 * Categoriza un día (laboral, sábado, domingo, festivo, etc.)
 */
export const calculateDayCategory = (
  date: Date,
  config: IConfig,
  vacationRanges?: { startDate: Date; endDate: Date }[]
): string => {
  // Verificar si está en período de vacación
  if (vacationRanges?.some(r => isDateInRange(date, r.startDate, r.endDate))) {
    return 'vacacion'
  }

  // Verificar si es festivo
  if (isHoliday(date, config)) {
    return 'festivo'
  }

  // Verificar si es sábado
  if (isSaturday(date)) {
    return 'sabado'
  }

  // Verificar si es domingo
  if (isSunday(date)) {
    return 'domingo'
  }

  // De lo contrario, es laboral
  return 'laboral'
}

/**
 * Comprueba si una fecha es festivo
 */
export const isHoliday = (date: Date, config: IConfig): boolean => {
  const month = date.getMonth()
  const day = date.getDate()

  // Comprobar festivos fijos españoles
  const isFixedHoliday = FIXED_HOLIDAYS.some(h => h.month === month && h.day === day)
  if (isFixedHoliday) return true

  // Comprobar festivos dependientes de Easter
  if (isEasterRelatedHoliday(date, date.getFullYear())) {
    return true
  }

  // Comprobar festivos personalizados
  if (config.customHolidays?.length > 0) {
    const isCustom = config.customHolidays.some(h => {
      const [m, d] = h.split('-').map(Number)
      return m === month && d === day
    })
    if (isCustom) return true
  }

  return false
}

/**
 * Calcula el nivel de presión para un día
 */
export const calculatePressureLevel = (
  date: Date,
  config: IConfig,
  previousMTEConsumption: number = 0
): number => {
  let basePressure = DEFAULT_PRESSURE_LEVELS.LAB_NORMAL

  // Ajustar por tipo de día
  if (isSaturday(date) || isSunday(date)) {
    basePressure = DEFAULT_PRESSURE_LEVELS.SD_NORMAL
  } else if (isHoliday(date, config)) {
    basePressure = DEFAULT_PRESSURE_LEVELS.FESTIVOS
  } else if (isWeekend(date)) {
    basePressure = DEFAULT_PRESSURE_LEVELS.SD_NORMAL
  }

  // Ajustar por estación/período especial
  const month = date.getMonth()
  const dayOfWeek = getDayOfWeek(date)

  // Verano (rojo)
  if (month >= 5 && month <= 8) {
    // Junio-Septiembre
    if (isWeekend(date)) {
      basePressure = config.presionAltaSD || DEFAULT_PRESSURE_LEVELS.SD_SUMMER
    } else {
      basePressure = config.presionAltaLab || DEFAULT_PRESSURE_LEVELS.LAB_SUMMER
    }
  }
  // Invierno (cian)
  else if (month === 11 || month === 0 || month === 1) {
    // Diciembre, Enero, Febrero
    if (isWeekend(date)) {
      basePressure = config.presionInviernoSD || DEFAULT_PRESSURE_LEVELS.SD_WINTER
    } else {
      basePressure = config.presionInviernoLab || DEFAULT_PRESSURE_LEVELS.LAB_WINTER
    }
  }
  // Semana Santa (violeta)
  else if (isEasterRelatedHoliday(date, date.getFullYear())) {
    basePressure = config.presionSemanaSanta || DEFAULT_PRESSURE_LEVELS.EASTER
  }

  // Puentes (ámbar)
  if (isDayBeforeLongWeekend(date, config)) {
    basePressure = Math.max(basePressure, config.presionPuentes || DEFAULT_PRESSURE_LEVELS.BRIDGES)
  }

  // Viernes (cielo)
  if (dayOfWeek === 5) {
    basePressure = Math.max(basePressure, config.presionViernes || DEFAULT_PRESSURE_LEVELS.FRIDAY)
  }

  // Martes (índigo)
  if (dayOfWeek === 2) {
    basePressure = Math.min(basePressure, config.presionMartes || DEFAULT_PRESSURE_LEVELS.TUESDAY)
  }

  // Ajustar por consumo MTE anterior
  if (previousMTEConsumption > 0) {
    basePressure *= 1 + previousMTEConsumption / 1000 // Factor de ajuste dinámico
  }

  return basePressure
}

/**
 * Comprueba si es día antes de fin de semana largo (puente)
 */
const isDayBeforeLongWeekend = (date: Date, config: IConfig): boolean => {
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  const nextNextDay = new Date(date)
  nextNextDay.setDate(nextNextDay.getDate() + 2)

  const isBeforeWeekend =
    isWeekend(nextDay) && (isHoliday(nextNextDay, config) || isWeekend(nextNextDay))
  const isBeforeHoliday =
    isHoliday(nextDay, config) && (isWeekend(nextNextDay) || isHoliday(nextNextDay, config))

  return isBeforeWeekend || isBeforeHoliday
}

/**
 * Calcula el multiplicador de cuota automática (A)
 */
export const calculateAutoProfileMultiplier = (config: IConfig, monthIndex: number): number => {
  for (const segment of AUTO_A_PROFILE_SEGMENTS) {
    if (segment.months.includes(monthIndex)) {
      return config[segment.key as keyof IConfig] as number
    }
  }
  return 1.0
}

/**
 * Calcula el nombre del segmento de auto-profile para un mes
 */
export const getAutoProfileSegmentName = (monthIndex: number): string => {
  for (const segment of AUTO_A_PROFILE_SEGMENTS) {
    if (segment.months.includes(monthIndex)) {
      return segment.label
    }
  }
  return 'Desconocido'
}

/**
 * Obtiene todos los cupos mensuales
 */
export const getMonthlyQuotas = (config: IConfig): IMonthlyQuota[] => {
  const quotas: IMonthlyQuota[] = []

  for (let i = 0; i < 12; i++) {
    const labKey = `c_${i}_0` as const
    const sdKey = `c_${i}_1` as const
    const festKey = `c_${i}_2` as const
    const pesoKey = `pesoC_${i}` as const

    const quota: IMonthlyQuota = {
      month: i,
      laboral: (config[labKey] as number) || 0,
      sabadoDomingo: (config[sdKey] as number) || 0,
      festivos: (config[festKey] as number) || 0,
      pesoC: (config[pesoKey] as number) || 1.0,
      autoPriorityA: calculateAutoProfileMultiplier(config, i),
    }

    quotas.push(quota)
  }

  return quotas
}

/**
 * Comprueba si junio está dividido
 */
export const isJuneSplit = (config: IConfig): boolean => {
  return (config.c_5q1_0 ?? 0) > 0 && (config.c_5q2_0 ?? 0) > 0
}

/**
 * Obtiene el cupo de un día específico
 */
export const getDayQuota = (date: Date, config: IConfig): number => {
  const month = date.getMonth()
  const day = date.getDate()

  // Enero no tiene cupo A
  if (month === 0) {
    return 0
  }

  // Junio puede ser dividido
  if (month === 5) {
    if (day <= 15) {
      return (config.c_5q1_0 ?? 0) + (config.c_5q1_1 ?? 0) + (config.c_5q1_2 ?? 0)
    } else {
      return (config.c_5q2_0 ?? 0) + (config.c_5q2_1 ?? 0) + (config.c_5q2_2 ?? 0)
    }
  }

  // Otros meses
  const baseKey = `c_${month}_0` as const
  const sdKey = `c_${month}_1` as const
  const festKey = `c_${month}_2` as const

  return (config[baseKey] as number ?? 0) + (config[sdKey] as number ?? 0) + (config[festKey] as number ?? 0)
}

/**
 * Calcula la utilización de MTE
 */
export const calculateMTEUtilization = (assigned: number, total: number): number => {
  if (total === 0) return 0
  return (assigned / total) * 100
}

/**
 * Obtiene información de un día entrada
 */
export const createDayEntry = (
  date: Date,
  dayType: string,
  config: IConfig,
  pressure: number = 1.0,
  quota: number = 0
): IDayEntry => {
  return {
    date,
    dayOfWeek: getDayOfWeek(date),
    week: getISOWeek(date),
    month: date.getMonth(),
    year: date.getFullYear(),
    dayType: dayType as any,
    pressure,
    quota,
    holiday: dayType === 'festivo',
    vacation: dayType === 'vacacion',
  }
}
