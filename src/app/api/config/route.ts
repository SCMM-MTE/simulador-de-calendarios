/**
 * API Route: GET/POST /api/config
 * Obtiene y guarda configuración
 */

import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_CONFIG } from '@/lib/constants/defaults'
import { validateConfig } from '@/lib/utils/validation'
import { IApiResponse } from '@/lib/types/simulator'

/**
 * GET /api/config
 * Retorna la configuración actual (desde localStorage fallback)
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Por ahora, retornar configuración por defecto
    // En futuro, esto obtenría de DB
    const response: IApiResponse<typeof DEFAULT_CONFIG> = {
      success: true,
      data: DEFAULT_CONFIG,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/config:', error)
    const response: IApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error retrieving configuration',
      },
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * POST /api/config
 * Guarda una configuración
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { config } = body

    if (!config) {
      const response: IApiResponse<null> = {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Configuration data is required',
        },
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validar configuración
    const validation = validateConfig(config)

    if (!validation.isValid) {
      const response: IApiResponse<null> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Configuration validation failed',
          details: { errors: validation.errors },
        },
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    // En futuro, guardar en DB
    // Por ahora, solo validar que sea correcto
    const response: IApiResponse<{ id: string; savedAt: string }> = {
      success: true,
      data: {
        id: `config_${Date.now()}`,
        savedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/config:', error)
    const response: IApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error saving configuration',
      },
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
