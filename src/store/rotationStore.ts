/**
 * Zustand Store para Estado de Rotación
 */

import { create } from 'zustand'

interface RotationStore {
  // State
  rotationSequence: string[]
  currentStep: number
  isPlaying: boolean
  playbackSpeed: number // 0.5x, 1x, 2x

  // Actions
  setRotationSequence: (sequence: string[]) => void
  moveUnit: (fromIndex: number, toIndex: number) => void
  resetSequence: () => void
  setCurrentStep: (step: number) => void
  setIsPlaying: (playing: boolean) => void
  setPlaybackSpeed: (speed: number) => void
  nextStep: () => void
  previousStep: () => void
  resetPlayback: () => void
}

const DEFAULT_SEQUENCE = ['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3', 'A4', 'B4', 'C4']

export const useRotationStore = create<RotationStore>((set) => ({
  rotationSequence: DEFAULT_SEQUENCE,
  currentStep: 0,
  isPlaying: false,
  playbackSpeed: 1,

  setRotationSequence: (sequence) => {
    set({ rotationSequence: sequence })
  },

  moveUnit: (fromIndex, toIndex) => {
    set((state) => {
      const newSequence = [...state.rotationSequence]
      const [unit] = newSequence.splice(fromIndex, 1)
      newSequence.splice(toIndex, 0, unit)
      return { rotationSequence: newSequence }
    })
  },

  resetSequence: () => {
    set({
      rotationSequence: DEFAULT_SEQUENCE,
      currentStep: 0,
      isPlaying: false,
    })
  },

  setCurrentStep: (step) => {
    set({ currentStep: step })
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing })
  },

  setPlaybackSpeed: (speed) => {
    set({ playbackSpeed: speed })
  },

  nextStep: () => {
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 51), // 13 períodos × 4 unidades
    }))
  },

  previousStep: () => {
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    }))
  },

  resetPlayback: () => {
    set({
      currentStep: 0,
      isPlaying: false,
    })
  },
}))
