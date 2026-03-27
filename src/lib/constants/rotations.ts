/**
 * Constantes de Rotación
 * Grupos, subgrupos, secuencias y unidades
 */

export const ROTATION_GROUPS = ['A', 'B', 'C'] as const

export const ROTATION_SUBS = [1, 2, 3, 4] as const

/**
 * Todas las unidades de rotación posibles
 */
export const ROTATION_UNITS = [
  'A1', 'A2', 'A3', 'A4',
  'B1', 'B2', 'B3', 'B4',
  'C1', 'C2', 'C3', 'C4',
] as const

/**
 * Secuencia base de rotación (13 períodos)
 * Orden de asignación en rotación: 1, 13, 2, 12, 3, 11, 4, 10, 5, 9, 6, 8, 7
 * 
 * Explicación:
 * - Comienza con el 1 (primera vuelta rápida)
 * - Alterna joven-viejo para equilibrio: 1 (joven), 13 (viejo), 2 (joven), 12 (viejo)
 * - Termina con 7 en medio
 */
export const ROTATION_BASE_SEQUENCE = [1, 13, 2, 12, 3, 11, 4, 10, 5, 9, 6, 8, 7] as const

/**
 * Longitud del ciclo de rotación (períodos)
 */
export const ROTATION_CYCLE_LENGTH = 13 as const

/**
 * Número de unidades de rotación
 */
export const TOTAL_ROTATION_UNITS = 12 as const

/**
 * Número de descansos por ciclo (días)
 */
export const DAYS_PER_ROTATION = 13 as const

/**
 * Orden DEFAULT de unidades de rotación
 * A1 -> B1 -> C1 -> A2 -> B2 -> C2 -> A3 -> B3 -> C3 -> A4 -> B4 -> C4
 */
export const DEFAULT_ROTATION_UNIT_SEQUENCE = [
  'A1', 'B1', 'C1',
  'A2', 'B2', 'C2',
  'A3', 'B3', 'C3',
  'A4', 'B4', 'C4',
] as const

/**
 * Colores para visualización de unidades
 */
export const ROTATION_UNIT_COLORS: Record<string, string> = {
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
} as const

/**
 * Palabras clave para reconocer grupos y subgrupos
 */
export const ROTATION_PATTERNS = {
  GROUPS: /^[ABC]$/i,
  SUBS: /^[1-4]$/,
  UNIT: /^[ABC][1-4]$/i,
} as const

/**
 * Patrones de descanso comunes
 */
export const REST_PATTERNS = {
  // Patrón estándar: L-M, X, J-V
  STANDARD: 'L-M|X|J-V',
  // Patrón alternativo
  ALT1: 'L|X|J-V',
} as const

/**
 * Métricas de rotación
 */
export const ROTATION_METRICS = {
  MAX_UNFAIRNESS: 10, // Máxima diferencia permitida entre unidades
  MIN_FAIRNESS_SCORE: 75, // Puntuación mínima de equidad (0-100)
  IDEAL_DAYS_PER_UNIT: 365 / 12, // ~30.4 días por año
} as const

/**
 * Valores por defecto para rotación
 */
export const ROTATION_DEFAULTS = {
  PROJECTION_YEARS: 4,
  BASE_SEQUENCE: ROTATION_BASE_SEQUENCE,
  UNIT_SEQUENCE: DEFAULT_ROTATION_UNIT_SEQUENCE,
  CYCLE_LENGTH: ROTATION_CYCLE_LENGTH,
} as const
