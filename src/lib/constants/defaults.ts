/**
 * Valores por Defecto del Sistema
 */

import { IConfig } from '@/lib/types/config'

/**
 * Configuración por defecto cuando se inicia la app o se resetea
 */
export const DEFAULT_CONFIG: IConfig = {
  // Datos Generales
  globalMTE: 2100,
  maxSolapamiento: 7,
  creditosAutoA: 12,
  proyeccionAnos: 4,

  // Rotación
  rotationDneList: [],
  rotationDneFileName: '',
  rotationUnitSequence: ['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3', 'A4', 'B4', 'C4'],

  // Presión (Niveles)
  presionLab: 1.0,
  presionSD: 0.8,
  presionFes: 0.6,
  presionAltaLab: 1.5, // Rojo: Verano
  presionAltaSD: 1.3,
  presionInviernoLab: 0.9, // Cian: Invierno
  presionInviernoSD: 0.7,
  presionSemanaSanta: 1.2, // Violeta
  presionPuentes: 1.1, // Ámbar
  presionViernes: 1.05, // Cielo
  presionMartes: 0.95, // Índigo

  // PAP
  maxPAPGlobal: 8,
  autoAssignPAP: true,
  prioridadPAP: 0.5,

  pap_invierno_lab: 2,
  pap_invierno_sab: 1,
  pap_invierno_dom: 1,
  pap_junioQ2_lab: 3,
  pap_junioQ2_sab: 1,
  pap_junioQ2_dom: 1,
  pap_julio_lab: 4,
  pap_julio_sab: 2,
  pap_julio_dom: 2,
  pap_agosto_lab: 4,
  pap_agosto_sab: 2,
  pap_agosto_dom: 2,
  pap_septiembre_lab: 3,
  pap_septiembre_sab: 1,
  pap_septiembre_dom: 1,

  // Auto Profile (5 tramos)
  autoProfileSegment1: 1.0, // Enero-Febrero
  autoProfileSegment2: 1.0, // Marzo-Mayo
  autoProfileSegment3: 1.5, // Junio-Septiembre (verano, presión alta)
  autoProfileSegment4: 1.0, // Octubre
  autoProfileSegment5: 1.0, // Noviembre-Diciembre

  // Cupos Mensuales por defecto (ejemplo)
  // Enero (sin cupo A)
  c_0_0: 0,
  c_0_1: 0,
  c_0_2: 0,
  pesoC_0: 1.0,

  // Febrero
  c_1_0: 22,
  c_1_1: 6,
  c_1_2: 2,
  pesoC_1: 1.0,

  // Marzo
  c_2_0: 23,
  c_2_1: 8,
  c_2_2: 2,
  pesoC_2: 1.0,

  // Abril
  c_3_0: 22,
  c_3_1: 8,
  c_3_2: 3,
  pesoC_3: 1.0,

  // Mayo
  c_4_0: 23,
  c_4_1: 8,
  c_4_2: 2,
  pesoC_4: 1.0,

  // Junio Q1 (1-15)
  c_5q1_0: 11,
  c_5q1_1: 4,
  c_5q1_2: 1,
  pesoC_5q1: 1.0,

  // Junio Q2 (16-30)
  c_5q2_0: 12,
  c_5q2_1: 4,
  c_5q2_2: 1,
  pesoC_5q2: 1.0,

  // Julio
  c_6_0: 23,
  c_6_1: 8,
  c_6_2: 2,
  pesoC_6: 1.0,

  // Agosto
  c_7_0: 23,
  c_7_1: 8,
  c_7_2: 2,
  pesoC_7: 1.0,

  // Septiembre
  c_8_0: 22,
  c_8_1: 8,
  c_8_2: 3,
  pesoC_8: 1.0,

  // Octubre
  c_9_0: 23,
  c_9_1: 8,
  c_9_2: 2,
  pesoC_9: 1.0,

  // Noviembre
  c_10_0: 22,
  c_10_1: 8,
  c_10_2: 3,
  pesoC_10: 1.0,

  // Diciembre
  c_11_0: 23,
  c_11_1: 8,
  c_11_2: 2,
  pesoC_11: 1.0,

  // Festivos Personalizados
  customHolidays: [],
}

/**
 * Valores por defecto para presión
 */
export const DEFAULT_PRESSURE_LEVELS = {
  LAB_NORMAL: 1.0,
  SD_NORMAL: 0.8,
  FESTIVOS: 0.6,
  LAB_SUMMER: 1.5,
  SD_SUMMER: 1.3,
  LAB_WINTER: 0.9,
  SD_WINTER: 0.7,
  EASTER: 1.2,
  BRIDGES: 1.1,
  FRIDAY: 1.05,
  TUESDAY: 0.95,
} as const

/**
 * Valores por defecto para créditos y flex
 */
export const DEFAULT_FLEX_DAYS = {
  A: 12, // Créditos para Calendar A
  B: 10,
  C: 8,
} as const

export const DEFAULT_FLEX_DAYS_A = 12

/**
 * Configuración de almacenamiento
 */
export const STORAGE_KEYS = {
  CONFIG: 'scmmConfig',
  CONFIGS_LIST: 'scmmConfigsList',
  LAST_CONFIG_ID: 'scmmLastConfigId',
  SETTINGS: 'scmmSettings',
  CACHE: 'scmmCache',
} as const

/**
 * Timeouts
 */
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30s
  CALCULATION: 60000, // 60s
  EXPORT: 45000, // 45s
} as const

/**
 * Límites de datos
 */
export const LIMITS = {
  MAX_CUSTOM_HOLIDAYS: 50,
  MAX_VACATION_RANGES: 100,
  MAX_DNA_IMPORTS: 500,
  CALCULATION_MAX_YEARS: 10,
  MAX_SCENARIOS_COMPARISON: 5,
} as const

/**
 * Colores por tipo de día
 */
export const DAY_TYPE_COLORS = {
  laboral: '#FFFFFF',
  sabado: '#F3F4F6',
  domingo: '#F3F4F6',
  festivo: '#FEE2E2',
  vacacion: '#DBEAFE',
  descanso: '#FEF3C7',
} as const

/**
 * Emoji por tipo de día
 */
export const DAY_TYPE_EMOJIS = {
  laboral: '📅',
  sabado: '🏖️',
  domingo: '😴',
  festivo: '🎉',
  vacacion: '✈️',
  descanso: '☀️',
} as const

/**
 * Formato de fechas
 */
export const DATE_FORMATS = {
  DISPLAY: 'd/M/yyyy', // 1/3/2026
  ISO: 'yyyy-MM-dd', // 2026-03-01
  FULL: 'EEEE, d MMMM yyyy', // Friday, 1 March 2026
  SHORT: 'dd/MM/yy', // 01/03/26
} as const
