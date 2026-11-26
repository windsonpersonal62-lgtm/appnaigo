import { useMemo, useState, type FormEvent } from 'react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PageHeader } from '@/components/navigation/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { DateInput } from '@astryxdesign/core/DateInput'
import { TimeInput } from '@astryxdesign/core/TimeInput'
import { Selector } from '@astryxdesign/core/Selector'
import { TextArea } from '@astryxdesign/core/TextArea'
import { Avatar } from '@astryxdesign/core/Avatar'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuthUser } from '@/lib/supabase/useAuthUser'
import { studentRepository } from '@/features/students/repositories/studentRepository'
import {
  addDays,
  dayKey,
  endTime,
  findConflict,
  formatTime,
  groupByDay,
  sameDay,
  startOfWeek,
  type ScheduleDraft,
  type ScheduleEntry,
  type ScheduleStatus,
} from '../domain/schedule'
import { scheduleRepository } from '../repositories/scheduleRepository'

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const STATUS_LABEL: Record<ScheduleStatus, string> = { scheduled: 'Agendado', done: 'Concluído', canceled: 'Cancelado' }
const STATUS_TONE = { scheduled: 'informative', done: 'success', canceled: 'neutral' } as const

interface FormState {
  id?: string
  title: string
  date: string
  time: string
  durationMinutes: string
  studentId: string
  location: string
  notes: string
  status: ScheduleStatus
}

function emptyForm(day: Date): FormState {
  return { title: '', date: dayKey(day), time: '08:00', durationMinutes: '60', studentId: '', location: '', notes: '', status: 'scheduled' }
}

function formFromEntry(entry: ScheduleEntry): FormState {
  const d = new Date(entry.startsAt)
  return {
    id: entry.id,
    title: entry.title,
    date: dayKey(d),
    time: formatTime(entry.startsAt),
    durationMinutes: String(entry.durationMinutes),
    studentId: entry.studentId ?? '',
    location: entry.location,
    notes: entry.notes,
    status: entry.status,
  }
}

function toDraft(form: FormState): ScheduleDraft {
  return {
    title: form.title,
    startsAt: new Date(`${form.date}T${form.time}:00`).toISOString(),
    durationMinutes: Number(form.durationMinutes),
    studentId: form.studentId || null,
    location: form.location,
    notes: form.notes,
    status: form.status,
  }
}

/** Agenda do personal (v1): visão de semana + lista do dia, criar/editar/cancelar horários. */
export function TrainerSchedulePage() {
  const { status: authStatus } = useAuthUser()
  const [selected, setSelected] = useState(() => new Date())
  const [refresh, setRefresh] = useState(0)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const weekStart = useMemo(() => startOfWeek(selected), [selected])
  const days = useMemo(() => WEEKDAYS.map((_, i) => addDays(weekStart, i)), [weekStart])

  const { status, data: entries, errorMessage } = useAsyncData(
    () => (authStatus === 'authenticated' ? scheduleRepository.listBetween(weekStart, addDays(weekStart, 7)) : Promise.resolve([])),
    [authStatus, weekStart.getTime(), refresh],
  )
  const { data: students } = useAsyncData(
    () => (authStatus === 'authenticated' ? studentRepository.findAll() : Promise.resolve([])),
    [authStatus],
  )

  const byDay = useMemo(() => groupByDay(entries ?? []), [entries])
  const dayEntries = byDay.get(dayKey(selected)) ?? []
  const studentName = (id: string | null) => students?.find((s) => s.id === id)?.name
  const conflict = form && form.date && form.time ? findConflict({ ...toDraft(form), id: form.id }, entries ?? []) : null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form) return
    if (!form.title.trim()) return setFormError('Dê um título ao horário.')
    setSaving(true)
    setFormError(null)
    try {
      const draft = toDraft(form)
      if (form.id) await scheduleRepository.update(form.id, draft)
      else await scheduleRepository.create(draft)
      setSelected(new Date(draft.startsAt))
      setForm(null)
      setRefresh((n) => n + 1)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!form?.id || !window.confirm('Excluir este horário?')) return
    setSaving(true)
    try {
      await scheduleRepository.remove(form.id)
      setForm(null)
      setRefresh((n) => n + 1)
    } finally {
      setSaving(false)
    }
  }

  const set = (patch: Partial<FormState>) => setForm((f) => (f ? { ...f, ...patch } : f))
  const monthRaw = weekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const monthLabel = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1)

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile py-8 md:px-margin-desktop">
      <PageHeader
        eyebrow="Agenda"
        title="Minha agenda"
        description="Seus horários da semana. Só você vê esta agenda."
        actions={
          <Button onClick={() => setForm(emptyForm(selected))}>
            <Icon name="add" />
            Novo horário
          </Button>
        }
      />

      <Card tone="surface" className="mt-6 rounded-xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" aria-label="Semana anterior" className="rounded-full p-2 hover:bg-surface-high" onClick={() => setSelected(addDays(selected, -7))}>
            <Icon name="chevron_left" />
          </button>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-text-primary">{monthLabel}</p>
            <button type="button" className="text-xs font-medium text-action-primary" onClick={() => setSelected(new Date())}>
              Hoje
            </button>
          </div>
          <button type="button" aria-label="Próxima semana" className="rounded-full p-2 hover:bg-surface-high" onClick={() => setSelected(addDays(selected, 7))}>
            <Icon name="chevron_right" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const active = sameDay(day, selected)
            const isToday = sameDay(day, new Date())
            const count = (byDay.get(dayKey(day)) ?? []).filter((e) => e.status !== 'canceled').length
            return (
              <button
                key={dayKey(day)}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(day)}
                className={`flex flex-col items-center gap-1 rounded-lg py-2 transition-colors ${active ? 'bg-action-primary text-action-primary-foreground' : 'hover:bg-surface-high'}`}
              >
                <span className={`text-[11px] uppercase tracking-wide ${active ? '' : 'text-text-secondary'}`}>{WEEKDAYS[i]}</span>
                <span className={`font-display text-lg font-semibold ${isToday && !active ? 'text-action-primary' : ''}`}>{day.getDate()}</span>
                <span className="flex h-1.5 gap-0.5">
                  {Array.from({ length: Math.min(count, 3) }).map((_, k) => (
                    <span key={k} className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-action-primary-foreground' : 'bg-action-primary'}`} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      <h2 className="mt-8 mb-3 font-display text-sm font-semibold uppercase tracking-wide text-text-secondary">
        {selected.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
      </h2>

      {status === 'loading' && <LoadingState label="Carregando agenda…" />}
      {status === 'error' && <ErrorState title="Não foi possível carregar a agenda" description={errorMessage ?? undefined} />}
      {status === 'ready' && dayEntries.length === 0 && (
        <EmptyState icon="event_available" title="Dia livre" description="Nenhum horário marcado. Toque em “Novo horário” para agendar." />
      )}
      {status === 'ready' && dayEntries.length > 0 && (
        <ol className="flex flex-col gap-3">
          {dayEntries.map((entry) => (
            <li key={entry.id}>
              <button type="button" onClick={() => setForm(formFromEntry(entry))} className="w-full text-left">
                <Card tone="surface" interactive className={`flex gap-4 rounded-xl p-4 ${entry.status === 'canceled' ? 'opacity-50' : ''}`}>
                  <div className="w-14 shrink-0 border-r border-border/60 pr-3 text-right">
                    <p className="font-display text-base font-semibold text-text-primary">{formatTime(entry.startsAt)}</p>
                    <p className="text-xs text-text-secondary">{formatTime(endTime(entry))}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 font-semibold leading-snug text-text-primary">{entry.title}</p>
                      <span className="shrink-0"><Badge tone={STATUS_TONE[entry.status]}>{STATUS_LABEL[entry.status]}</Badge></span>
                    </div>
                    <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-text-secondary">
                      {studentName(entry.studentId) && (
                        <span className="inline-flex items-center gap-1.5"><Avatar name={studentName(entry.studentId)} size={20} tooltip={false} />{studentName(entry.studentId)}</span>
                      )}
                      {entry.location && (
                        <span className="inline-flex items-center gap-1"><Icon name="location_on" className="text-base" />{entry.location}</span>
                      )}
                    </p>
                  </div>
                </Card>
              </button>
            </li>
          ))}
        </ol>
      )}

      <BottomSheet
        isOpen={form !== null}
        onOpenChange={(open) => !open && setForm(null)}
        label={form?.id ? 'Editar horário' : 'Novo horário'}
        purpose="form"
        height="tall"
      >
        {form && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-1 pb-4">
            <h2 className="font-display text-xl font-bold">{form.id ? 'Editar horário' : 'Novo horário'}</h2>
            <Input label="Título" placeholder="Ex.: Treino funcional" value={form.title} onChange={(e) => set({ title: e.target.value })} required maxLength={120} />
            <Selector
              label="Aluno"
              size="lg"
              value={form.studentId || 'none'}
              onChange={(v) => set({ studentId: !v || v === 'none' ? '' : v })}
              hasSearch={(students?.length ?? 0) > 6}
              searchPlaceholder="Buscar aluno…"
              emptySearchText="Nenhum aluno encontrado"
              options={[{ value: 'none', label: 'Sem aluno (compromisso pessoal)' }, ...(students ?? []).map((st) => ({ value: st.id, label: st.name }))]}
            />
            <DateInput label="Data" isRequired value={form.date as never} onChange={(v) => v && set({ date: v })} />
            <div className="grid grid-cols-2 gap-3">
              <TimeInput label="Hora" isRequired value={form.time as never} onChange={(v) => v && set({ time: v.slice(0, 5) })} />
              <Selector
                label="Duração"
                size="lg"
                value={form.durationMinutes}
                onChange={(v) => v && set({ durationMinutes: v })}
                options={['30', '45', '60', '90', '120'].map((m) => ({ value: m, label: `${m} min` }))}
              />
            </div>
            <Selector
              label="Status"
              size="lg"
              value={form.status}
              onChange={(v) => v && set({ status: v as ScheduleStatus })}
              options={(Object.keys(STATUS_LABEL) as ScheduleStatus[]).map((st) => ({ value: st, label: STATUS_LABEL[st] }))}
            />
            <Input label="Local" placeholder="Ex.: Academia, online, parque" value={form.location} onChange={(e) => set({ location: e.target.value })} />
            <TextArea label="Observações" isOptional value={form.notes} onChange={(v) => set({ notes: v })} placeholder="Algo para lembrar nesse horário" />
            {conflict && form.status !== 'canceled' && (
              <p role="status" className="flex items-center gap-2 rounded-xl bg-warning/15 px-3 py-2 text-sm text-warning">
                <Icon name="warning" /> Conflita com “{conflict.title}” às {formatTime(conflict.startsAt)}.
              </p>
            )}
            {formError && <p role="alert" className="text-sm text-error">{formError}</p>}
            <div className="mt-2 flex gap-3">
              {form.id && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>
                  <Icon name="delete" /> Excluir
                </Button>
              )}
              <Button type="submit" disabled={saving} fullWidth={!form.id} className={form.id ? 'flex-1' : ''}>
                {saving ? 'Salvando…' : 'Salvar horário'}
              </Button>
            </div>
          </form>
        )}
      </BottomSheet>
    </div>
  )
}
