const STORAGE_KEY = "bible-plan-completed"

export function getCompletedDays(): Set<number> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

export function markDayComplete(day: number): void {
  const completed = getCompletedDays()
  completed.add(day)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
}

export function markDayIncomplete(day: number): void {
  const completed = getCompletedDays()
  completed.delete(day)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}
