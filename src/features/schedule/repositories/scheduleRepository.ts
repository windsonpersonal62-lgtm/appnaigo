import { getSupabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import type { ScheduleDraft, ScheduleEntry, ScheduleStatus } from '../domain/schedule'

type Row = Database['public']['Tables']['trainer_schedule']['Row']

function toDomain(row: Row): ScheduleEntry {
  return {
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    studentId: row.student_id,
    location: row.location,
    notes: row.notes,
    status: row.status as ScheduleStatus,
  }
}

function toRow(draft: ScheduleDraft) {
  return {
    title: draft.title.trim(),
    starts_at: draft.startsAt,
    duration_minutes: draft.durationMinutes,
    student_id: draft.studentId,
    location: draft.location.trim(),
    notes: draft.notes.trim(),
    status: draft.status,
  }
}

/** Agenda do personal logado. `trainer_id` vem do default `auth.uid()` e a RLS garante o resto. */
export const scheduleRepository = {
  async listBetween(from: Date, to: Date): Promise<ScheduleEntry[]> {
    const { data, error } = await getSupabase()
      .from('trainer_schedule')
      .select('*')
      .gte('starts_at', from.toISOString())
      .lt('starts_at', to.toISOString())
      .order('starts_at')
    if (error) throw error
    return data.map(toDomain)
  },

  async create(draft: ScheduleDraft): Promise<ScheduleEntry> {
    const { data, error } = await getSupabase().from('trainer_schedule').insert(toRow(draft)).select().single()
    if (error) throw error
    return toDomain(data)
  },

  async update(id: string, draft: ScheduleDraft): Promise<ScheduleEntry> {
    const { data, error } = await getSupabase()
      .from('trainer_schedule')
      .update(toRow(draft))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toDomain(data)
  },

  async remove(id: string): Promise<void> {
    const { error } = await getSupabase().from('trainer_schedule').delete().eq('id', id)
    if (error) throw error
  },
}
