// Lightweight wrapper around localStorage for demo state

export function saveLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Silently fail if localStorage is unavailable (SSR, private browsing, etc.)
  }
}

export function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function removeLocal(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

