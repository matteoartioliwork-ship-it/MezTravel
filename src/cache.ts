// Mémoire temporaire des réponses des services : la perdre est sans conséquence.
export function readCache<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null
  } catch {
    return null
  }
}

export function writeCache(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Mémoire pleine ou indisponible : on redemandera au service.
  }
}
