/**
 * Cliente API tipado
 * Wrapper para fetch con manejo de errores y tipos
 */

import { IConfig } from '@/lib/types/config'
import { ISimulatorResult } from '@/lib/types/calendar'
import { IApiResponse, IConfigImportResponse, ICalendarCalculationResponse } from '@/lib/types/simulator'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * Opciones para request
 */
interface FetchOptions extends RequestInit {
  timeout?: number
}

/**
 * Fetch genérico con timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { timeout = 30000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Helper para hacer requests
 */
const apiRequest = async <T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ data: T; status: number } | null> => {
  try {
    const url = `${API_URL}${endpoint}`
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    return { data, status: response.status }
  } catch (error) {
    console.error(`API error on ${endpoint}:`, error)
    return null
  }
}

/**
 * API Client
 */
export const apiClient = {
  /**
   * Obtiene la configuración actual
   */
  getConfig: async (): Promise<IConfig | null> => {
    const result = await apiRequest<IApiResponse<IConfig>>('/api/config', {
      method: 'GET',
    })

    if (result && result.status === 200) {
      return result.data.data || null
    }

    return null
  },

  /**
   * Guarda una configuración
   */
  saveConfig: async (config: IConfig): Promise<boolean> => {
    const result = await apiRequest<IApiResponse>('/api/config', {
      method: 'POST',
      body: JSON.stringify({ config }),
    })

    return result ? result.status >= 200 && result.status < 300 : false
  },

  /**
   * Importa configuración desde contenido
   */
  importConfig: async (content: string, format: 'json' | 'txt'): Promise<IConfig | null> => {
    const result = await apiRequest<IApiResponse<IConfigImportResponse>>('/api/config/import', {
      method: 'POST',
      body: JSON.stringify({ content, format }),
    })

    if (result && result.status === 200 && result.data.data?.config) {
      return result.data.data.config
    }

    return null
  },

  /**
   * Exporta configuración
   */
  exportConfig: async (
    config: IConfig,
    format: 'json' | 'txt' = 'json'
  ): Promise<{ content: string; filename: string } | null> => {
    const result = await apiRequest<
      IApiResponse<{ content: string; filename: string; format: string }>
    >('/api/config/export', {
      method: 'POST',
      body: JSON.stringify({ config, format }),
    })

    if (result && result.status === 200 && result.data.data) {
      return {
        content: result.data.data.content,
        filename: result.data.data.filename,
      }
    }

    return null
  },

  /**
   * Calcula un calendario
   */
  calculateCalendar: async (
    config: IConfig,
    startDate: string,
    endDate: string,
    type: 'A' | 'B' | 'C' = 'A'
  ): Promise<ISimulatorResult | null> => {
    const result = await apiRequest<IApiResponse<ISimulatorResult>>('/api/calendar/calculate', {
      method: 'POST',
      body: JSON.stringify({
        config,
        startDate,
        endDate,
        type,
      }),
      timeout: 60000, // 60 segundos para cálculos pesados
    })

    if (result && result.status === 200 && result.data.data) {
      return result.data.data
    }

    return null
  },

  /**
   * Health check del API
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/api/config`, {
        method: 'GET',
        timeout: 5000,
      })
      return response.ok
    } catch {
      return false
    }
  },
}

/**
 * Hook para usar apiClient con manejo de errores
 */
export const useAPI = () => {
  return {
    apiClient,
    isProduction: process.env.NODE_ENV === 'production',
  }
}
