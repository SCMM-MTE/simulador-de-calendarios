/**
 * Tipos de Configuración Global
 * Define la estructura completa de la configuración del simulador
 */

export type CalendarType = 'A' | 'B' | 'C'
export type RotationGroup = 'A' | 'B' | 'C'
export type RotationSub = 1 | 2 | 3 | 4
export type DayType = 'laboral' | 'sabado' | 'domingo' | 'festivo' | 'vacacion' | 'descanso'
export type PressureLevel = number // 0-10, factor de presión

/**
 * Configuración Auto de Perfiles (5 tramos)
 */
export interface AutoProfileSegment {
  key: string
  label: string
  months: number[] // índices de meses (0-11)
  value: number
}

/**
 * Configuración Global del Simulador
 */
export interface IConfig {
  // Datos Generales
  globalMTE: number // Plantilla MTE total
  maxSolapamiento: number // Máximo solapamiento permitido en días
  creditosAutoA: number // Créditos automáticos por MTE (Cal. A)
  proyeccionAnos: number // Años para proyección de rotación

  // Rotación
  rotationDneList: string[] // Lista de DNEs importados
  rotationDneFileName: string // Nombre del archivo importado
  rotationUnitSequence: string[] // Secuencia personalizada de unidades

  // Presión (Niveles)
  presionLab: number // Presión labs normales
  presionSD: number // Presión sábado-domingo normales
  presionFes: number // Presión festivos
  presionAltaLab: number // Presión labs verano (rojo)
  presionAltaSD: number // Presión S/D verano (rojo)
  presionInviernoLab: number // Presión labs invierno (cian)
  presionInviernoSD: number // Presión S/D invierno (cian)
  presionSemanaSanta: number // Presión Semana Santa (violeta)
  presionPuentes: number // Presión puentes (ámbar)
  presionViernes: number // Presión viernes (cielo)
  presionMartes: number // Presión martes (índigo)

  // PAP (Personal Asignado a Proyectos)
  maxPAPGlobal: number // Máximo de días PAP por MTE
  autoAssignPAP: boolean // Habilitar asignación automática
  prioridadPAP: number // Peso de prioridad vs vacaciones

  // Cupos PAP por temporada (Lab / Sábado / Domingo)
  pap_invierno_lab: number
  pap_invierno_sab: number
  pap_invierno_dom: number
  pap_junioQ2_lab: number
  pap_junioQ2_sab: number
  pap_junioQ2_dom: number
  pap_julio_lab: number
  pap_julio_sab: number
  pap_julio_dom: number
  pap_agosto_lab: number
  pap_agosto_sab: number
  pap_agosto_dom: number
  pap_septiembre_lab: number
  pap_septiembre_sab: number
  pap_septiembre_dom: number

  // Auto Profile (5 tramos)
  autoProfileSegment1: number // Enero-Febrero
  autoProfileSegment2: number // Marzo-Mayo
  autoProfileSegment3: number // Junio-Septiembre
  autoProfileSegment4: number // Octubre
  autoProfileSegment5: number // Noviembre-Diciembre

  // Cupos Mensuales (Lab / S+D / Festivos) + Peso (C)
  // Para cada mes i (0-11):
  c_0_0?: number // Enero: laboral
  c_0_1?: number // Enero: S/D
  c_0_2?: number // Enero: festivos
  pesoC_0?: number // Enero: peso C

  // ... repeats para meses 1-11 (se puede hacer dinámico)
  c_1_0?: number // Febrero: laboral
  c_1_1?: number
  c_1_2?: number
  pesoC_1?: number

  c_2_0?: number // Marzo
  c_2_1?: number
  c_2_2?: number
  pesoC_2?: number

  c_3_0?: number // Abril
  c_3_1?: number
  c_3_2?: number
  pesoC_3?: number

  c_4_0?: number // Mayo
  c_4_1?: number
  c_4_2?: number
  pesoC_4?: number

  // Junio: 2 quincenas
  c_5q1_0?: number // Junio Q1: laboral
  c_5q1_1?: number
  c_5q1_2?: number
  pesoC_5q1?: number
  c_5q2_0?: number // Junio Q2: laboral
  c_5q2_1?: number
  c_5q2_2?: number
  pesoC_5q2?: number

  c_6_0?: number // Julio
  c_6_1?: number
  c_6_2?: number
  pesoC_6?: number

  c_7_0?: number // Agosto
  c_7_1?: number
  c_7_2?: number
  pesoC_7?: number

  c_8_0?: number // Septiembre
  c_8_1?: number
  c_8_2?: number
  pesoC_8?: number

  c_9_0?: number // Octubre
  c_9_1?: number
  c_9_2?: number
  pesoC_9?: number

  c_10_0?: number // Noviembre
  c_10_1?: number
  c_10_2?: number
  pesoC_10?: number

  c_11_0?: number // Diciembre
  c_11_1?: number
  c_11_2?: number
  pesoC_11?: number

  // Festivos Personalizados
  customHolidays: string[] // Formato: "mes-dia" (0-indexed)

  // Metadata
  name?: string // Nombre de la configuración
  description?: string
  version?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Interfaz para descargar tipos de configuración
 */
export interface IConfigExport {
  version: '2.0'
  config: IConfig
  exportedAt: string
  exportedBy?: string
}

/**
 * Errores de validación
 */
export interface IConfigError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

/**
 * Resultado de validación de config
 */
export interface IValidationResult {
  isValid: boolean
  errors: IConfigError[]
  warnings: IConfigError[]
}
