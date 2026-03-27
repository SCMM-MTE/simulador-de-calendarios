/**
 * API Route: POST /api/config/export
 * Exporta configuración en diferentes formatos
 */

import { NextRequest, NextResponse } from 'next/server'
import { exportConfigToJSON, exportConfigToTXT, createFilename } from '@/lib/utils/export'
import { IApiResponse } from '@/lib/types/simulator'
import { IConfig } from '@/lib/types/config'

/**
 * POST /api/config/export
 * Exporta configuración a JSON o TXT
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { config, format = 'json' } = body as { config: IConfig; format?: 'json' | 'txt' }

    if (!config || !config.globalMTE) {
      const response: IApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_CONFIG',
          message: 'Valid configuration is required',
        },
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    let content: string
    let contentType: string
    let filename: string

    if (format === 'json') {
      content = exportConfigToJSON(config)
      contentType = 'application/json'
      filename = createFilename('config', 'json')
    } else if (format === 'txt') {
      content = exportConfigToTXT(config)
      contentType = 'text/plain'
      filename = createFilename('config', 'txt')
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

    const response: IApiResponse<{ content: string; filename: string; format: string }> = {
      success: true,
      data: {
        content,
        filename,
        format,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error in POST /api/config/export:', error)
    const response: IApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error exporting configuration',
      },
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
