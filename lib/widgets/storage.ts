import type { DashboardLayout } from './types';

export function loadLayout(persona: string): DashboardLayout | null {
  try {
    const raw = localStorage.getItem(`layout:${persona}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLayout(layout: DashboardLayout) {
  try {
    localStorage.setItem(`layout:${layout.persona}`, JSON.stringify(layout));
  } catch {
    // Ignore storage errors
  }
}

export function clearLayout(persona: string) {
  try {
    localStorage.removeItem(`layout:${persona}`);
  } catch {
    // Ignore storage errors
  }
}

