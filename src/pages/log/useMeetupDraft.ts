import { useState } from 'react'
import { type DraftFields, type Step, firstEmptyStep } from './meetupDraft'

interface DraftState {
  draft: DraftFields
  step: Step
}

export function useMeetupDraft(initial: DraftFields) {
  const [{ draft, step }, setState] = useState<DraftState>(() => ({ draft: initial, step: firstEmptyStep(initial) }))

  const update = (changes: Partial<DraftFields>) =>
    setState((current) => ({ ...current, draft: { ...current.draft, ...changes } }))

  const fill = (changes: Partial<DraftFields> = {}) =>
    setState((current) => {
      const next = { ...current.draft, ...changes }

      return { draft: next, step: firstEmptyStep(next) }
    })

  const open = (target: Step) => setState((current) => ({ ...current, step: target }))

  return { draft, step, update, fill, open }
}
