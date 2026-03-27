/**
 * Tipos generales del Simulador
 */

import { IConfig, IConfigError, IValidationResult } from './config'
import { ISimulatorResult, IDayEntry } from './calendar'
import { IRotationCalculation } from './rotation'

/**
 * Estado global de la aplicación
 */
export interface IAppState {
  currentView: 'calendar-a' | 'calendar-b' | 'calendar-c' | 'rotation' | 'analysis' | 'settings'
  config: IConfig
  isLoading: boolean
  error?: string
}

/**
 * Solicitud de cálculo de calendario
 */
export interface ICalendarCalculationRequest {
  configId: string
  config: IConfig
  startDate: string // ISO date
  endDate: string
  type: 'A' | 'B' | 'C'
}

/**
 * Respuesta de cálculo de calendario
 */
export interface ICalendarCalculationResponse {
  success: boolean
  result?: ISimulatorResult
  error?: string
  calculationTime?: number
}

/**
 * Solicitud de exportación
 */
export interface IExportRequest {
  format: 'excel' | 'json' | 'txt' | 'pdf' | 'png'
  data: ISimulatorResult | IRotationCalculation | IConfig
  filename?: string
}

/**
 * Solicitud de importación de configuración
 */
export interface IConfigImportRequest {
  content: string
  format: 'json' | 'txt'
}

/**
 * Respuesta de importación de configuración
 */
export interface IConfigImportResponse {
  success: boolean
  config?: IConfig
  errors?: IConfigError[]
  warnings?: IConfigError[]
}

/**
 * Solicitud de validación de configuración
 */
export interface IConfigValidationRequest {
  config: IConfig
}

/**
 * Resultado de análisis
 */
export interface IAnalysisResult {
  configId: string
  results: ISimulatorResult[]
  comparison?: {
    bestScenario: 'A' | 'B' | 'C'
    utilizationRates: Record<string, number>
    recommendations: string[]
  }
  generatedAt: string
}

/**
 * Datos de usuario (para futuro auth)
 */
export interface IUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: string
}

/**
 * Sesión de usuario
 */
export interface ISession {
  userId: string
  token: string
  expiresAt: string
  configs: string[] // IDs de configuraciones guardadas
}

/**
 * Notificación/Toast
 */
export interface INotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number // ms
  action?: {
    label: string
    callback: () => void
  }
}

/**
 * Response genérica de API
 */
export interface IApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
}
