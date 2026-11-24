export type ScheduleStatus = 'scheduled' | 'done' | 'canceled'

export interface ScheduleEntry {
  id: string
  title: string
  startsAt: string
  durationMinutes: number
  studentId: string | null
  location: string
  notes: string
  status: ScheduleStatus
}

export type ScheduleDraft = Omit<ScheduleEntry, 'id'>

/** Segunda-feira 00:00 (horário local) da semana que contém `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - offset)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Agrupa por dia (chave yyyy-mm-dd local) e ordena por horário. */
export function groupByDay(entries: ScheduleEntry[]): Map<string, ScheduleEntry[]> {
  const map = new Map<string, ScheduleEntry[]>()
  for (const entry of [...entries].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const key = dayKey(new Date(entry.startsAt))
    map.set(key, [...(map.get(key) ?? []), entry])
  }
  return map
}

export function dayKey(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function endTime(entry: Pick<ScheduleEntry, 'startsAt' | 'durationMinutes'>): string {
  return new Date(new Date(entry.startsAt).getTime() + entry.durationMinutes * 60_000).toISOString()
}

/** Primeiro conflito de horário com outro item ativo (cancelados não contam), ou null. */
export function findConflict(
  draft: Pick<ScheduleEntry, 'startsAt' | 'durationMinutes'> & { id?: string },
  entries: ScheduleEntry[],
): ScheduleEntry | null {
  const start = new Date(draft.startsAt).getTime()
  const end = start + draft.durationMinutes * 60_000
  return (
    entries.find((e) => {
      if (e.id === draft.id || e.status === 'canceled') return false
      const s = new Date(e.startsAt).getTime()
      return s < end && start < s + e.durationMinutes * 60_000
    }) ?? null
  )
}
