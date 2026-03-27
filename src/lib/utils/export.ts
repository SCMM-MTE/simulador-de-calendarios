/**
 * Funciones de Exportación
 * Exportar a Excel, JSON, TXT, PDF, PNG
 */

import { IConfig, IConfigExport } from '@/lib/types/config'
import { ISimulatorResult } from '@/lib/types/calendar'
import { IRotationVisualization } from '@/lib/types/rotation'
import { formatDate } from './helpers'

/**
 * Exporta configuración a JSON
 */
export const exportConfigToJSON = (config: IConfig, name: string = 'config'): string => {
  const exportData: IConfigExport = {
    version: '2.0',
    config,
    exportedAt: new Date().toISOString(),
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Exporta configuración a TXT
 */
export const exportConfigToTXT = (config: IConfig): string => {
  let txt = '='.repeat(80) + '\n'
  txt += 'SIMULADOR DE CALENDARIOS SCMM - EXPORTACIÓN DE CONFIGURACIÓN\n'
  txt += '='.repeat(80) + '\n\n'

  txt += 'DATOS GENERALES\n'
  txt += '-'.repeat(40) + '\n'
  txt += `MTE Total: ${config.globalMTE}\n`
  txt += `Máx Solapamiento: ${config.maxSolapamiento} días\n`
  txt += `Créditos Auto (Cal. A): ${config.creditosAutoA}\n`
  txt += `Proyección Años: ${config.proyeccionAnos}\n\n`

  txt += 'NIVELES DE PRESIÓN\n'
  txt += '-'.repeat(40) + '\n'
  txt += `Lab. Normales: ${config.presionLab}\n`
  txt += `S/D Normales: ${config.presionSD}\n`
  txt += `Festivos: ${config.presionFes}\n`
  txt += `Lab. Verano (Jun-Sep): ${config.presionAltaLab}\n`
  txt += `S/D Verano: ${config.presionAltaSD}\n`
  txt += `Lab. Invierno: ${config.presionInviernoLab}\n`
  txt += `S/D Invierno: ${config.presionInviernoSD}\n`
  txt += `Semana Santa: ${config.presionSemanaSanta}\n`
  txt += `Puentes: ${config.presionPuentes}\n`
  txt += `Viernes: ${config.presionViernes}\n`
  txt += `Martes: ${config.presionMartes}\n\n`

  txt += 'GESTIÓN DE PAP\n'
  txt += '-'.repeat(40) + '\n'
  txt += `Días PAP por MTE: ${config.maxPAPGlobal}\n`
  txt += `Auto-Asignación Activa: ${config.autoAssignPAP ? 'Sí' : 'No'}\n`
  txt += `Prioridad vs Vacaciones: ${config.prioridadPAP}\n\n`

  txt += 'AUTO PROFILE (5 TRAMOS)\n'
  txt += '-'.repeat(40) + '\n'
  txt += `Segment 1 (Ene-Feb): ${config.autoProfileSegment1}\n`
  txt += `Segment 2 (Mar-May): ${config.autoProfileSegment2}\n`
  txt += `Segment 3 (Jun-Sep): ${config.autoProfileSegment3}\n`
  txt += `Segment 4 (Oct): ${config.autoProfileSegment4}\n`
  txt += `Segment 5 (Nov-Dic): ${config.autoProfileSegment5}\n\n`

  txt += 'ROTACIÓN\n'
  txt += '-'.repeat(40) + '\n'
  txt += `DNEs Importados: ${config.rotationDneList?.length || 0}\n`
  txt += `Archivo: ${config.rotationDneFileName || 'Ninguno'}\n`
  txt += `Secuencia: ${config.rotationUnitSequence?.join(', ') || 'Por defecto'}\n\n`

  if (config.customHolidays && config.customHolidays.length > 0) {
    txt += 'FESTIVOS PERSONALIZADOS\n'
    txt += '-'.repeat(40) + '\n'
    config.customHolidays.forEach(h => {
      const [m, d] = h.split('-')
      txt += `${d}/${parseInt(m) + 1}\n`
    })
    txt += '\n'
  }

  txt += 'FECHA DE EXPORTACIÓN\n'
  txt += '-'.repeat(40) + '\n'
  txt += new Date().toLocaleString() + '\n'

  return txt
}

/**
 * Genera CSV para exportación a Excel
 */
export const exportCalendarToCSV = (result: ISimulatorResult): string => {
  let csv = 'Fecha,Día,Semana,Tipo,Presión,Cuota,Asignado,Notas\n'

  result.days.forEach(day => {
    const dateStr = formatDate(day.date, 'dd/MM/yyyy')
    const dayOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'][day.dayOfWeek]
    const type = day.dayType || ''
    const pressure = day.pressure ?? ''
    const quota = day.quota ?? ''
    const assigned = day.assigned || '-'

    csv += `"${dateStr}","${dayOfWeek}",${day.week},"${type}",${pressure},${quota},"${assigned}","${day.notes || ''}"\n`
  })

  return csv
}

/**
 * Importa configuración desde JSON
 */
export const importConfigFromJSON = (jsonString: string): IConfig | null => {
  try {
    const data = JSON.parse(jsonString)

    // Validar estructura
    if (!data.config) return null

    return data.config as IConfig
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return null
  }
}

/**
 * Crea un archivo Blob para descargar
 */
export const createDownloadBlob = (content: string, mimeType: string = 'text/plain'): Blob => {
  return new Blob([content], { type: mimeType })
}

/**
 * Descarga un archivo
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Crea nombre de archivo con timestamp
 */
export const createFilename = (prefix: string, extension: string): string => {
  const now = new Date()
  const timestamp = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0')

  return `${prefix}_${timestamp}.${extension}`
}

/**
 * Exporta análisis a JSON
 */
export const exportAnalysisToJSON = (
  scenarioA: ISimulatorResult,
  scenarioB: ISimulatorResult,
  scenarioC?: ISimulatorResult
): string => {
  const analysis = {
    timestamp: new Date().toISOString(),
    scenarios: {
      A: {
        startDate: scenarioA.startDate,
        endDate: scenarioA.endDate,
        totalDays: scenarioA.totalDays,
        utilizationRate: scenarioA.utilizationRate,
      },
      B: {
        startDate: scenarioB.startDate,
        endDate: scenarioB.endDate,
        totalDays: scenarioB.totalDays,
        utilizationRate: scenarioB.utilizationRate,
      },
      ...(scenarioC && {
        C: {
          startDate: scenarioC.startDate,
          endDate: scenarioC.endDate,
          totalDays: scenarioC.totalDays,
          utilizationRate: scenarioC.utilizationRate,
        },
      }),
    },
  }

  return JSON.stringify(analysis, null, 2)
}

/**
 * Convierte array a formato Excel-compatible
 */
export const arrayToExcelRows = (data: any[][]): string => {
  return data
    .map(row =>
      row
        .map(cell => {
          if (cell === null || cell === undefined) return ''
          if (typeof cell === 'string' && cell.includes(',')) {
            return `"${cell}"`
          }
          return cell
        })
        .join(',')
    )
    .join('\n')
}

/**
 * Prepara datos para tabla HTML
 */
export const createHTMLTable = (
  headers: string[],
  rows: any[][],
  title?: string
): string => {
  let html = ''

  if (title) {
    html += `<h2>${title}</h2>\n`
  }

  html += '<table border="1" cellspacing="0" cellpadding="5">\n'
  html += '<thead><tr>'

  headers.forEach(h => {
    html += `<th>${h}</th>`
  })

  html += '</tr></thead>\n<tbody>\n'

  rows.forEach(row => {
    html += '<tr>'
    row.forEach(cell => {
      html += `<td>${cell}</td>`
    })
    html += '</tr>\n'
  })

  html += '</tbody></table>\n'

  return html
}

/**
 * Genera código QR (simple versión de texto)
 */
export const generateQRText = (configId: string, timestamp: string): string => {
  return `Config ID: ${configId}\nTimestamp: ${timestamp}`
}
