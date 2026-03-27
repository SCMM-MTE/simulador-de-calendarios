/**
 * API Route: POST /api/calendar/calculate
 * Calcula un calendar simulado
 */

import { NextRequest, NextResponse } from 'next/server'
import { IApiResponse, ICalendarCalculationRequest, ICalendarCalculationResponse } from '@/lib/types/simulator'
import { validateConfig } from '@/lib/utils/validation'
import { calculateDayCategory, calculatePressureLevel, getMonthlyQuotas, createDayEntry } from '@/lib/utils/calendar'
import { getDaysInRange } from '@/lib/utils/helpers'
import { IConfig } from '@/lib/types/config'
import { ISimulatorResult } from '@/lib/types/calendar'

/**
 * POST /api/calendar/calculate
 * Calcula calendário para fechas dadas
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { config, startDate, endDate, type = 'A' } = body as ICalendarCalculationRequest

    // Validar configuración
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
      return NextResponse.json(response, { status: 422 })
    }

    // Parsear fechas
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const response: IApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Invalid date format',
        },
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (start > end) {
      const response: IApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'Start date must be before end date',
        },
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Calcular calendario
    const days = getDaysInRange(start, end)
    let assignedCount = 0
    let previousMTEConsumption = 0

    const dayEntries = days.map(day => {
      const dayCategory = calculateDayCategory(day, config as IConfig)
      const pressure = calculatePressureLevel(day, config as IConfig, previousMTEConsumption)

      // Simulación simple de asignación
      if (dayCategory === 'laboral' && previousMTEConsumption < config.globalMTE * 0.8) {
        assignedCount++
        previousMTEConsumption += pressure * 10
      }

      return createDayEntry(day, dayCategory, config as IConfig, pressure)
    })

    const quotas = getMonthlyQuotas(config as IConfig)
    const result: ISimulatorResult = {
      calendarType: type as any,
      configId: `config_${Date.now()}`,
      startDate: start,
      endDate: end,
      days: dayEntries,
      monthlyQuotas: quotas,
      vacationRanges: [],
      totalDays: days.length,
      assignedDays: assignedCount,
      availableDays: days.length - assignedCount,
      utilizationRate: assignedCount / days.length,
      createdAt: new Date().toISOString(),
      calculationTime: Date.now() - startTime,
      mteTotal: config.globalMTE,
      groupDistribution: {
        A: Math.round(config.globalMTE / 3),
        B: Math.round(config.globalMTE / 3),
        C: Math.round(config.globalMTE / 3),
      },
    }

    const response: IApiResponse<ISimulatorResult> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error in POST /api/calendar/calculate:', error)
    const response: IApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error calculating calendar',
      },
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
