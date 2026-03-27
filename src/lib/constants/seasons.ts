/**
 * Constantes de Temporadas y Fechas
 */

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const DIAS_SEMANA_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/**
 * Festivos fijos españoles
 */
export const FIXED_HOLIDAYS = [
  { month: 0, day: 1, name: 'Año Nuevo' },
  { month: 0, day: 6, name: 'Reyes' },
  { month: 4, day: 1, name: 'Día del Trabajador' },
  { month: 7, day: 15, name: 'Asunción de María' },
  { month: 9, day: 12, name: 'Fiesta Nacional de España' },
  { month: 10, day: 1, name: 'Día de Todos los Santos' },
  { month: 11, day: 6, name: 'Día de la Constitución' },
  { month: 11, day: 25, name: 'Navidad' },
]

/**
 * Festivos dependientes de Easter (variables cada año)
 * Se calculan dinámicamente con algoritmo Computus
 */
export const EASTER_DEPENDENT_HOLIDAYS = [
  { offsetDays: -3, name: 'Jueves Santo' },
  { offsetDays: -2, name: 'Viernes Santo' },
]

/**
 * Estaciones españolas (meses aproximados)
 */
export const SEASONS = {
  INVIERNO: { start: 11, end: 2, name: 'Invierno' }, // Dic, Ene, Feb
  PRIMAVERA: { start: 2, end: 5, name: 'Primavera' }, // Mar, Abr, May
  VERANO: { start: 5, end: 8, name: 'Verano' }, // Jun, Jul, Ago
  OTONO: { start: 8, end: 11, name: 'Otoño' }, // Sep, Oct, Nov
} as const

/**
 * Períodos estacionales para presión
 */
export const PRESSURE_SEASONS = {
  NORMAL: 'normal',
  VERANO_ALTA: 'verano_alta', // Jun-Sep, presión roja
  INVIERNO: 'invierno', // Dic-Feb, presión cian
  SEMANA_SANTA: 'semana_santa', // Alrededor de Easter, violeta
  PUENTES: 'puentes', // Puentes especiales, ámbar
} as const

/**
 * Meses de cada tramo del perfil automático (5 segmentos)
 */
export const AUTO_A_PROFILE_SEGMENTS = [
  {
    key: 'autoProfileSegment1',
    label: '📅 Enero - Febrero',
    months: [0, 1],
  },
  {
    key: 'autoProfileSegment2',
    label: '🌸 Marzo - Mayo',
    months: [2, 3, 4],
  },
  {
    key: 'autoProfileSegment3',
    label: '☀️ Junio - Septiembre',
    months: [5, 6, 7, 8],
  },
  {
    key: 'autoProfileSegment4',
    label: '🍂 Octubre',
    months: [9],
  },
  {
    key: 'autoProfileSegment5',
    label: '❄️ Noviembre - Diciembre',
    months: [10, 11],
  },
]

/**
 * Referencias de fechas
 */
export const DATE_REFERENCES = {
  // Lunes de referencia para cálculos de semanas
  MONDAY_ANCHOR: new Date(2021, 0, 4), // 4 de enero de 2021 era lunes
  
  // Año fiscal común
  FISCAL_YEAR_START: 1, // Enero
  FISCAL_YEAR_END: 12, // Diciembre
}

/**
 * Duración en milisegundos
 */
export const TIME_UNITS = {
  DAY_MS: 24 * 60 * 60 * 1000,
  WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  MONTH_MS: 30 * 24 * 60 * 60 * 1000, // Aproximado
  YEAR_MS: 365 * 24 * 60 * 60 * 1000,
} as const

/**
 * Mapeo de nombres de temporada a meses
 */
export const SEASON_MONTH_MAP: Record<number, string> = {
  11: 'INVIERNO', // Diciembre
  0: 'INVIERNO', // Enero
  1: 'INVIERNO', // Febrero
  2: 'PRIMAVERA', // Marzo
  3: 'PRIMAVERA', // Abril
  4: 'PRIMAVERA', // Mayo
  5: 'VERANO', // Junio
  6: 'VERANO', // Julio
  7: 'VERANO', // Agosto
  8: 'OTONO', // Septiembre
  9: 'OTONO', // Octubre
  10: 'OTONO', // Noviembre
}
