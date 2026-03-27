/**
 * Funciones de validación de configuración
 */

import { IConfig, IValidationResult, IConfigError } from '@/lib/types/config'
import { LIMITS } from '@/lib/constants/defaults'

/**
 * Valida una configuración completa
 */
export const validateConfig = (config: IConfig): IValidationResult => {
  const errors: IConfigError[] = []
  const warnings: IConfigError[] = []

  // Validar globalMTE
  if (!config.globalMTE || config.globalMTE < 100) {
    errors.push({
      field: 'globalMTE',
      message: 'MTE total debe ser mayor a 100',
      severity: 'error',
    })
  }

  // Validar maxSolapamiento
  if (config.maxSolapamiento != null && config.maxSolapamiento < 0) {
    errors.push({
      field: 'maxSolapamiento',
      message: 'Solapamiento no puede ser negativo',
      severity: 'error',
    })
  }

  // Validar creditosAutoA
  if (config.creditosAutoA != null && config.creditosAutoA < 0) {
    errors.push({
      field: 'creditosAutoA',
      message: 'Créditos auto no pueden ser negativos',
      severity: 'error',
    })
  }

  // Validar proyeccionAnos
  if (!config.proyeccionAnos || config.proyeccionAnos < 1 || config.proyeccionAnos > LIMITS.CALCULATION_MAX_YEARS) {
    warnings.push({
      field: 'proyeccionAnos',
      message: `Años de proyección debe estar entre 1 y ${LIMITS.CALCULATION_MAX_YEARS}`,
      severity: 'warning',
    })
  }

  // Validar presión levels
  const pressureFields: (keyof IConfig)[] = [
    'presionLab',
    'presionSD',
    'presionFes',
    'presionAltaLab',
    'presionAltaSD',
    'presionInviernoLab',
    'presionInviernoSD',
    'presionSemanaSanta',
    'presionPuentes',
    'presionViernes',
    'presionMartes',
  ]

  pressureFields.forEach(field => {
    const value = config[field] as number
    if (value != null && (value < 0 || value > 10)) {
      warnings.push({
        field: String(field),
        message: 'Valor de presión debe estar entre 0 y 10',
        severity: 'warning',
      })
    }
  })

  // Validar PAP
  if (config.maxPAPGlobal != null && config.maxPAPGlobal < 0) {
    errors.push({
      field: 'maxPAPGlobal',
      message: 'Máximo de días PAP no puede ser negativo',
      severity: 'error',
    })
  }

  // Validar custom holidays
  if (config.customHolidays && config.customHolidays.length > LIMITS.MAX_CUSTOM_HOLIDAYS) {
    errors.push({
      field: 'customHolidays',
      message: `No se pueden agregar más de ${LIMITS.MAX_CUSTOM_HOLIDAYS} festivos personalizados`,
      severity: 'error',
    })
  }

  // Validar DNE list
  if (config.rotationDneList && config.rotationDneList.length > LIMITS.MAX_DNA_IMPORTS) {
    errors.push({
      field: 'rotationDneList',
      message: `No se pueden importar más de ${LIMITS.MAX_DNA_IMPORTS} DNEs`,
      severity: 'error',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Valida los cupos de un mes
 */
export const validateMonthlyQuotas = (
  laboral: number,
  sabadoDomingo: number,
  festivos: number
): boolean => {
  return laboral >= 0 && sabadoDomingo >= 0 && festivos >= 0
}

/**
 * Valida un rango de fechas de vacación
 */
export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate
}

/**
 * Comprueba si la configuración tiene todos los cupos configurados
 */
export const isConfigComplete = (config: IConfig): boolean => {
  // Verificar que haya al menos algunos cupos configurados
  const hasQuotas = [
    config.c_1_0,
    config.c_2_0,
    config.c_3_0,
    config.c_4_0,
  ].some(q => q != null && q > 0)

  return hasQuotas && config.globalMTE > 0
}

/**
 * Detecta problemas comunes en la configuración
 */
export const detectConfigErrors = (config: IConfig): string[] => {
  const errors: string[] = []

  if (!config.globalMTE) {
    errors.push('No se ha configurado el MTE total')
  }

  if (!config.rotationUnitSequence || config.rotationUnitSequence.length === 0) {
    errors.push('Secuencia de rotación vacía')
  }

  if (config.presionLab == null || config.presionSDundefined) {
    errors.push('Niveles de presión no configurados correctamente')
  }

  return errors
}

/**
 * Valida un custom holiday string (formato: "mes-dia")
 */
export const validateCustomHolidayFormat = (holiday: string): boolean => {
  const parts = holiday.split('-')
  if (parts.length !== 2) return false
  
  const [months, days] = parts
  const m = parseInt(months, 10)
  const d = parseInt(days, 10)
  
  return m >= 0 && m <= 11 && d >= 1 && d <= 31
}

/**
 * Normaliza presión values (convierte negativos a positivos, etc.)
 */
export const normalizePressureValues = (config: IConfig): IConfig => {
  const normalized = { ...config }
  
  const fields: (keyof IConfig)[] = [
    'presionLab',
    'presionSD',
    'presionFes',
    'presionAltaLab',
    'presionAltaSD',
    'presionInviernoLab',
    'presionInviernoSD',
    'presionSemanaSanta',
    'presionPuentes',
    'presionViernes',
    'presionMartes',
  ]
  
  fields.forEach(field => {
    const value = normalized[field]
    if (typeof value === 'number') {
      normalized[field] = Math.max(0, Math.min(10, value)) as any
    }
  })
  
  return normalized
}
