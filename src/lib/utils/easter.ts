/**
 * Algoritmo Computus para calcular la fecha de Easter (Pascua)
 * Usando el método de Meeus/Jones/Butcher
 */

/**
 * Calcula la fecha de Easter para un año dado
 * @param year - Año (ej: 2026)
 * @returns Date - Fecha de Easter (Pascua)
 */
export const calculateEasterDate = (year: number): Date => {
  // Algoritmo Meeus/Jones/Butcher
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  
  return new Date(year, month - 1, day)
}

/**
 * Obtiene los festivos dependientes de Easter
 * @param year - Año
 * @returns Object con fechas de Jueves Santo y Viernes Santo
 */
export const getEasterRelatedHolidays = (
  year: number
): Record<string, Date> => {
  const easter = calculateEasterDate(year)
  
  // Obtener la fecha de Jueves Santo (3 días antes de Easter)
  const juevesDate = new Date(easter)
  juevesDate.setDate(juevesDate.getDate() - 3)
  
  // Obtener la fecha de Viernes Santo (2 días antes de Easter)
  const viernesDate = new Date(easter)
  viernesDate.setDate(viernesDate.getDate() - 2)
  
  return {
    easter: easter,
    jueveSanto: juevesDate,
    viernesSanto: viernesDate,
  }
}

/**
 * Comprueba si una fecha es un festivo relacionado con Easter
 * @param date - Fecha a verificar
 * @param year - Año
 * @returns boolean
 */
export const isEasterRelatedHoliday = (date: Date, year: number): boolean => {
  const holidays = getEasterRelatedHolidays(year)
  const dateStr = formatDateForComparison(date)
  
  return (
    dateStr === formatDateForComparison(holidays.jueveSanto) ||
    dateStr === formatDateForComparison(holidays.viernesSanto)
  )
}

/**
 * Formatea fecha para comparación
 */
const formatDateForComparison = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Calcula años hasta y desde Easter
 */
export const getEasterRange = (startYear: number, endYear: number): Map<number, Date> => {
  const map = new Map<number, Date>()
  for (let year = startYear; year <= endYear; year++) {
    map.set(year, calculateEasterDate(year))
  }
  return map
}
