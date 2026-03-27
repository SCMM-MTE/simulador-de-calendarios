/**
 * Zustand Store para Estado del Simulador
 */

import { create } from 'zustand'
import { ISimulatorResult } from '@/lib/types/calendar'

type CalendarType = 'A' | 'B' | 'C'

interface SimulatorStore {
  // State
  activeCalendarType: CalendarType
  results: Record<CalendarType, ISimulatorResult | null>
  selectedDates: Record<CalendarType, string[]>
  isCalculating: boolean
  calculationError: string | null

  // Actions
  setActiveCalendarType: (type: CalendarType) => void
  setResult: (type: CalendarType, result: ISimulatorResult) => void
  setSelectedDates: (type: CalendarType, dates: string[]) => void
  clearResult: (type: CalendarType) => void
  clearAllResults: () => void
  setIsCalculating: (isCalculating: boolean) => void
  setCalculationError: (error: string | null) => void
}

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  activeCalendarType: 'A',
  results: {
    A: null,
    B: null,
    C: null,
  },
  selectedDates: {
    A: [],
    B: [],
    C: [],
  },
  isCalculating: false,
  calculationError: null,

  setActiveCalendarType: (type) => {
    set({ activeCalendarType: type })
  },

  setResult: (type, result) => {
    set((state) => ({
      results: {
        ...state.results,
        [type]: result,
      },
      calculationError: null,
    }))
  },

  setSelectedDates: (type, dates) => {
    set((state) => ({
      selectedDates: {
        ...state.selectedDates,
        [type]: dates,
      },
    }))
  },

  clearResult: (type) => {
    set((state) => ({
      results: {
        ...state.results,
        [type]: null,
      },
      selectedDates: {
        ...state.selectedDates,
        [type]: [],
      },
    }))
  },

  clearAllResults: () => {
    set({
      results: {
        A: null,
        B: null,
        C: null,
      },
      selectedDates: {
        A: [],
        B: [],
        C: [],
      },
    })
  },

  setIsCalculating: (isCalculating) => {
    set({ isCalculating })
  },

  setCalculationError: (error) => {
    set({ calculationError: error })
  },
}))
