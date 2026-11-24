import { describe, expect, it } from 'vitest'
import { findConflict, groupByDay, startOfWeek, type ScheduleEntry } from '../domain/schedule'

const entry = (id: string, startsAt: string, durationMinutes = 60, status: ScheduleEntry['status'] = 'scheduled'): ScheduleEntry => ({
  id, title: id, startsAt, durationMinutes, studentId: null, location: '', notes: '', status,
})

describe('agenda', () => {
  it('semana começa na segunda', () => {
    expect(startOfWeek(new Date(2026, 10, 29)).getDay()).toBe(1) // domingo -> segunda anterior
    expect(startOfWeek(new Date(2026, 10, 24)).getDate()).toBe(23)
  })
  it('detecta sobreposição e ignora cancelados e o próprio item', () => {
    const list = [entry('a', '2026-11-24T11:00:00Z'), entry('b', '2026-11-24T13:00:00Z', 60, 'canceled')]
    expect(findConflict({ startsAt: '2026-11-24T11:30:00Z', durationMinutes: 30 }, list)?.id).toBe('a')
    expect(findConflict({ startsAt: '2026-11-24T12:00:00Z', durationMinutes: 60 }, list)).toBeNull()
    expect(findConflict({ startsAt: '2026-11-24T13:00:00Z', durationMinutes: 60 }, list)).toBeNull()
    expect(findConflict({ id: 'a', startsAt: '2026-11-24T11:00:00Z', durationMinutes: 60 }, list)).toBeNull()
  })
  it('agrupa por dia em ordem de horário', () => {
    const g = groupByDay([entry('late', '2026-11-24T20:00:00Z'), entry('early', '2026-11-24T10:00:00Z')])
    expect([...g.values()][0].map((e) => e.id)).toEqual(['early', 'late'])
  })
})
