import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { useParams } from 'react-router-dom'
import { COMMON_COPY } from '../../copy/common'
import { useGroups, useMeetups, usePeople } from '../../data/hooks'
import { NameTakenError, renamePerson } from '../../data/repo'
import { personSummary } from '../../domain/person'
import type { Group, Meetup, Person } from '../../domain/types'
import { useNamePrompt } from '../../hooks/useNamePrompt'
import { useToast } from '../../hooks/useToast'
import { FRIENDS_PATH } from '../../navigation/paths'
import { FRIENDS_COPY } from './copy'
import { MeetupHistory } from './MeetupHistory'
import { PersonSummaryList } from './PersonSummaryList'
import './friends.css'

interface PersonDetailsProps {
  person: Person
  people: Person[]
  groups: Group[]
  meetups: Meetup[]
}

function PersonDetails({ person, people, groups, meetups }: PersonDetailsProps) {
  const summary = personSummary(person.id, meetups)

  return (
    <>
      <PersonSummaryList person={person} summary={summary} />
      <MeetupHistory history={summary.history} people={people} groups={groups} />
    </>
  )
}

export function PersonPage() {
  const { personId } = useParams()
  const people = usePeople()
  const groups = useGroups()
  const meetups = useMeetups()
  const loaded = people && groups && meetups
  const person = people?.find((candidate) => candidate.id === personId)
  const promptName = useNamePrompt()
  const { toast } = useToast()

  async function saveName(id: string, newName: string) {
    try {
      await renamePerson(id, newName)
    } catch (error) {
      void toast(error instanceof NameTakenError ? error.message : COMMON_COPY.saveFailed)
    }
  }

  function rename({ id, name }: Person) {
    promptName({
      header: COMMON_COPY.rename,
      label: COMMON_COPY.name,
      name,
      onName: (newName) => void saveName(id, newName),
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={FRIENDS_PATH} text={COMMON_COPY.friends} />
          </IonButtons>
          <IonTitle>{person?.name}</IonTitle>
          {person && (
            <IonButtons slot="end">
              <IonButton onClick={() => rename(person)}>{COMMON_COPY.rename}</IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loaded && !person && <p className="friends-detail">{FRIENDS_COPY.personNotFound}</p>}
        {loaded && person && <PersonDetails person={person} people={people} groups={groups} meetups={meetups} />}
      </IonContent>
    </IonPage>
  )
}
