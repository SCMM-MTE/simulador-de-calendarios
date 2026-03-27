/**
 * Funciones auxiliares generales
 */

/**
 * Obtiene el día de la semana (0=domingo, 6=sábado)
 */
export const getDayOfWeek = (date: Date): number => {
  return date.getDay()
}

/**
 * Comprueba si es sábado
 */
export const isSaturday = (date: Date): boolean => {
  return getDayOfWeek(date) === 6
}

/**
 * Comprueba si es domingo
 */
export const isSunday = (date: Date): boolean => {
  return getDayOfWeek(date) === 0
}

/**
 * Comprueba si es fin de semana
 */
export const isWeekend = (date: Date): boolean => {
  const day = getDayOfWeek(date)
  return day === 0 || day === 6
}

/**
 * Obtiene el número de semana ISO (1-53)
 */
export const getISOWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Suma días a una fecha
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const ONE_DAY = 24 * 60 * 60 * 1000
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / ONE_DAY))
}

/**
 * Formatea una fecha a string (dd/MM/yyyy)
 */
export const formatDate = (date: Date, format: string = 'dd/MM/yyyy'): string => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  
  const formats: Record<string, string> = {
    'dd/MM/yyyy': `${day}/${month}/${year}`,
    'yyyy-MM-dd': `${year}-${month}-${day}`,
    'MM/dd/yyyy': `${month}/${day}/${year}`,
  }
  
  return formats[format] || formats['dd/MM/yyyy']
}

/**
 * Formatea una fecha ISO a Date
 */
export const parseISODate = (dateString: string): Date => {
  return new Date(dateString)
}

/**
 * Comprueba si dos fechas son el mismo día
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Obtiene el primer día del mes
 */
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1)
}

/**
 * Obtiene el último día del mes
 */
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0)
}

/**
 * Obtiene todos los días de un rango
 */
export const getDaysInRange = (startDate: Date, endDate: Date): Date[] => {
  const days: Date[] = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

/**
 * Comprueba si una fecha está dentro de un rango
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate
}

/**
 * Redondea un número a N decimales
 */
export const round = (num: number, decimals: number = 0): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Clamp: limita un valor entre min y max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calcula porcentaje
 */
export const percentage = (value: number, total: number, decimals: number = 1): number => {
  if (total === 0) return 0
  return round((value / total) * 100, decimals)
}

/**
 * Convierte objeto a query string
 */
export const objectToQueryString = (obj: Record<string, any>): string => {
  return Object.entries(obj)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

/**
 * Convierte query string a objeto
 */
export const queryStringToObject = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString)
  const obj: Record<string, string> = {}
  params.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}

/**
 * Verifica si dos arrays tienen los mismos elementos
 */
export const arraysEqual = <T>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) return false
  return a.every((val, idx) => val === b[idx])
}

/**
 * Elimina duplicados de un array
 */
export const removeDuplicates = <T>(arr: T[]): T[] => {
  return [...new Set(arr)]
}

/**
 * Agrupa array items por una función key
 */
export const groupBy = <T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return arr.reduce(
    (acc, item) => {
      const key = keyFn(item)
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<K, T[]>
  )
}
