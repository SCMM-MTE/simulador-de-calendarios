/**
 * API Route: POST /api/config/import
 * Importa una configuración desde archivo
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateConfig } from '@/lib/utils/validation'
import { IApiResponse, IConfigImportResponse } from '@/lib/types/simulator'
import { IConfig } from '@/lib/types/config'

/**
 * POST /api/config/import
 * Importa configuración desde JSON o TXT
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { content, format } = body

    if (!content || !format) {
      const response: IApiResponse<null> = {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Content and format are required',
        },
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    let config: IConfig | null = null

    // Parsear según formato
    if (format === 'json') {
      try {
        const data = JSON.parse(content)
        config = data.config || data
      } catch (error) {
        const response: IApiResponse<null> = {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Invalid JSON format',
          },
          timestamp: new Date().toISOString(),
        }
        return NextResponse.json(response, { status: 400 })
      }
    } else if (format === 'txt') {
      // Para TXT, intentar parsear como JSON o extraer valores
      try {
        // Intentar como JSON primero
        config = JSON.parse(content)
      } catch {
        // Si no es JSON válido, retornar error
        const response: IApiResponse<null> = {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Invalid TXT format - must be parseable as JSON',
          },
          timestamp: new Date().toISOString(),
        }
        return NextResponse.json(response, { status: 400 })
      }
    } else {
      const response: IApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: 'Format must be "json" or "txt"',
        },
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (!config || !config.globalMTE) {
      const response: IApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_CONFIG',
          message: 'Configuration must contain globalMTE',
        },
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validar configuración
    const validation = validateConfig(config)

    const response: IApiResponse<IConfigImportResponse> = {
      success: validation.isValid,
      data: {
        success: validation.isValid,
        config: validation.isValid ? config : undefined,
        errors: validation.errors.length > 0 ? validation.errors : undefined,
        warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: validation.isValid ? 200 : 422 })
  } catch (error) {
    console.error('Error in POST /api/config/import:', error)
    const response: IApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error importing configuration',
      },
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
