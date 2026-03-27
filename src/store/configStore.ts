/**
 * Zustand Store para Configuración Global
 * Persiste en localStorage automáticamente
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IConfig, IValidationResult } from '@/lib/types/config'
import { DEFAULT_CONFIG, STORAGE_KEYS } from '@/lib/constants/defaults'
import { validateConfig, normalizePressureValues } from '@/lib/utils/validation'

interface ConfigStore {
  // State
  config: IConfig
  validation: IValidationResult | null
  isDirty: boolean
  lastSavedAt: string | null

  // Actions
  setConfig: (config: IConfig) => void
  updateConfigField: <K extends keyof IConfig>(key: K, value: IConfig[K]) => void
  resetConfig: () => void
  validateConfig: () => IValidationResult
  loadConfigFromStorage: () => void
  saveConfigToStorage: () => void
  importConfig: (json: string) => boolean
  exportConfigJSON: () => string
  exportConfigTXT: () => string
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      validation: null,
      isDirty: false,
      lastSavedAt: null,

      setConfig: (config: IConfig) => {
        const normalized = normalizePressureValues(config)
        const validation = validateConfig(normalized)
        set({
          config: normalized,
          validation,
          isDirty: true,
        })
      },

      updateConfigField: (key, value) => {
        const { config } = get()
        const updated = { ...config, [key]: value }
        const normalized = normalizePressureValues(updated)
        const validation = validateConfig(normalized)
        set({
          config: normalized,
          validation,
          isDirty: true,
        })
      },

      resetConfig: () => {
        set({
          config: DEFAULT_CONFIG,
          validation: validateConfig(DEFAULT_CONFIG),
          isDirty: false,
          lastSavedAt: null,
        })
      },

      validateConfig: () => {
        const { config } = get()
        const validation = validateConfig(config)
        set({ validation })
        return validation
      },

      loadConfigFromStorage: () => {
        if (typeof window === 'undefined') return
        
        try {
          const stored = localStorage.getItem(STORAGE_KEYS.CONFIG)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.config) {
              set({
                config: parsed.config,
                validation: validateConfig(parsed.config),
                isDirty: false,
                lastSavedAt: parsed.lastSavedAt || null,
              })
            }
          }
        } catch (error) {
          console.error('Error loading config from storage:', error)
        }
      },

      saveConfigToStorage: () => {
        if (typeof window === 'undefined') return
        
        const { config } = get()
        try {
          const dataToSave = {
            config,
            lastSavedAt: new Date().toISOString(),
          }
          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(dataToSave))
          set({
            isDirty: false,
            lastSavedAt: dataToSave.lastSavedAt,
          })
        } catch (error) {
          console.error('Error saving config to storage:', error)
        }
      },

      importConfig: (jsonString: string) => {
        try {
          const data = JSON.parse(jsonString)
          const importedConfig = data.config || data

          if (!importedConfig.globalMTE) {
            return false
          }

          const normalized = normalizePressureValues(importedConfig)
          const validation = validateConfig(normalized)

          set({
            config: normalized,
            validation,
            isDirty: true,
          })

          return true
        } catch (error) {
          console.error('Error importing config:', error)
          return false
        }
      },

      exportConfigJSON: () => {
        const { config } = get()
        const exportData = {
          version: '2.0',
          config,
          exportedAt: new Date().toISOString(),
        }
        return JSON.stringify(exportData, null, 2)
      },

      exportConfigTXT: () => {
        const { config } = get()
        let txt = '='.repeat(80) + '\n'
        txt += 'SIMULADOR DE CALENDARIOS - CONFIGURACIÓN\n'
        txt += '='.repeat(80) + '\n\n'

        txt += `MTE Total: ${config.globalMTE}\n`
        txt += `Fecha Exportación: ${new Date().toLocaleString()}\n\n`

        return txt
      },
    }),
    {
      name: STORAGE_KEYS.CONFIG,
      version: 1,
    }
  )
)
