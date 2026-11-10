import { useIonAlert, useIonRouter } from '@ionic/react'
import { useRef, useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { addMeetup, deleteMeetup, forgetUnusedPeople, updateMeetup } from '../../data/repo'
import type { MeetupDraft } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { CALENDAR_PATH } from '../../navigation/paths'
import { LOG_COPY } from './copy'

function closeKeyboard() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

async function writeMeetup(draft: MeetupDraft, meetupId: string | undefined) {
  if (meetupId) {
    await updateMeetup(meetupId, draft)

    return
  }

  await addMeetup(draft)
}

export function useLogActions(meetupId: string | undefined) {
  const router = useIonRouter()
  const [presentAlert] = useIonAlert()
  const save = useSave()
  const [saving, setSaving] = useState(false)
  const newPersonIds = useRef<string[]>([])

  const rememberNewPerson = (personId: string) => {
    newPersonIds.current.push(personId)
  }

  function close() {
    void forgetUnusedPeople(newPersonIds.current)
    closeKeyboard()

    if (router.canGoBack()) {
      router.goBack()

      return
    }

    router.push(CALENDAR_PATH, 'back', 'replace')
  }

  async function saveMeetup(draft: MeetupDraft) {
    setSaving(true)
    const saved = await save(writeMeetup(draft, meetupId))

    if (!saved) {
      setSaving(false)

      return
    }

    close()
  }

  async function removeMeetup(id: string) {
    if (await save(deleteMeetup(id))) {
      close()
    }
  }

  const confirmDelete = (id: string) =>
    void presentAlert({
      header: LOG_COPY.deleteHeader,
      message: COMMON_COPY.deleteCannotBeUndone,
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        { text: COMMON_COPY.delete, role: 'destructive', handler: () => void removeMeetup(id) },
      ],
    })

  return { close, saving, saveMeetup, confirmDelete, rememberNewPerson }
}
