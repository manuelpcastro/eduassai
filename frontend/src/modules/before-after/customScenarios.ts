import { useSyncExternalStore } from 'react'
import type { PlayableScenario } from './types'

/**
 * Situations created by parents and teachers. There's no backend yet, so they
 * are kept in this browser's localStorage (photos included, resized).
 */
const STORAGE_KEY = 'eduassai.beforeAfter.custom'

export type CustomScenario = PlayableScenario

let cache: CustomScenario[] | null = null
const listeners = new Set<() => void>()

function read(): CustomScenario[] {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    cache = raw ? (JSON.parse(raw) as CustomScenario[]) : []
  } catch {
    cache = []
  }
  return cache
}

function write(next: CustomScenario[]) {
  // Throws if storage is full; callers show a message.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  cache = next
  listeners.forEach((l) => l())
}

export function listCustomScenarios(): CustomScenario[] {
  return read()
}

export function getCustomScenario(id: string | undefined): CustomScenario | undefined {
  return read().find((s) => s.id === id)
}

/** Adds the scenario, or replaces the one with the same id. */
export function saveCustomScenario(scenario: CustomScenario) {
  const list = read()
  const exists = list.some((s) => s.id === scenario.id)
  write(exists ? list.map((s) => (s.id === scenario.id ? scenario : s)) : [...list, scenario])
}

export function deleteCustomScenario(id: string) {
  write(read().filter((s) => s.id !== id))
}

export function newCustomId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** Test helper: forget the in-memory copy so storage is read again. */
export function resetCustomScenarioCache() {
  cache = null
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useCustomScenarios(): CustomScenario[] {
  return useSyncExternalStore(subscribe, read, read)
}
