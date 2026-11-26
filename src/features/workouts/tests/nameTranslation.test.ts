import { describe, expect, it } from 'vitest'
import rawCatalog from '../../../../public/data/exercises.json?raw'
import rawNames from '../../../../public/data/names.pt-BR.json?raw'
import type { NameTranslations, RawExerciseCatalog } from '../domain/exercise.types'
import { toExerciseCatalog } from '../domain/exerciseCatalog'

const raw = JSON.parse(rawCatalog) as RawExerciseCatalog
const names = JSON.parse(rawNames) as NameTranslations

describe('nomes revisados em pt-BR', () => {
  it('cobre todos os nomes do catálogo, sem órfãos', () => {
    const catalogNames = new Set(raw.exercises.map((e) => e.name))
    expect([...catalogNames].filter((n) => !names[n])).toEqual([])
    expect(Object.keys(names).filter((n) => !catalogNames.has(n))).toEqual([])
  })

  it('nomes diferentes em inglês nunca viram o mesmo nome em português', () => {
    const seen = new Map<string, string>()
    for (const [en, pt] of Object.entries(names)) {
      expect(seen.get(pt), `"${en}" e "${seen.get(pt)}" -> "${pt}"`).toBeUndefined()
      seen.set(pt, en)
    }
  })

  it('o catálogo usa o nome revisado e marca como traduzido', () => {
    const { exercises } = toExerciseCatalog(raw, {}, names)
    expect(exercises.every((e) => e.isNameTranslated)).toBe(true)
    const supino = exercises.find((e) => e.originalName === 'dumbbell incline bench press')
    expect(supino?.name).toBe(names['dumbbell incline bench press'])
  })
})
