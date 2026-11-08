import type { CSSProperties } from 'react'
import type { OrbitPerson, Ring } from '../../domain/orbit'
import { FRIENDS_COPY } from './copy'
import { agoLabel } from './sinceLabel'

const RINGS: Ring[] = [0, 1, 2]

const RING_DIAMETERS: Record<Ring, number> = { 0: 150, 1: 270, 2: 390 }

const OUTER_DIAMETER = RING_DIAMETERS[2]

const FULL_SHARE = 100

const CENTRE_SHARE = FULL_SHARE / 2

const RING_LABEL_ANGLES: Record<Ring, number> = { 0: Math.PI / 2, 1: -Math.PI / 2, 2: -Math.PI / 5 }

const diameterShare = (ring: Ring) => (RING_DIAMETERS[ring] / OUTER_DIAMETER) * FULL_SHARE

function pointOnRing(ring: Ring, angle: number): CSSProperties {
  const radius = diameterShare(ring) / 2

  return {
    left: `${CENTRE_SHARE + radius * Math.cos(angle)}%`,
    top: `${CENTRE_SHARE - radius * Math.sin(angle)}%`,
  }
}

interface OrbitFieldProps {
  orbit: OrbitPerson[]
  overdueId: string | undefined
  onOpen: (personId: string) => void
}

export function OrbitField({ orbit, overdueId, onOpen }: OrbitFieldProps) {
  return (
    <div className="orbit-field">
      {RINGS.map((ring) => (
        <div key={ring} className="orbit-ring" style={{ width: `${diameterShare(ring)}%` }} aria-hidden="true" />
      ))}
      {RINGS.map((ring) => (
        <span
          key={ring}
          className="orbit-ring-label"
          style={pointOnRing(ring, RING_LABEL_ANGLES[ring])}
          aria-hidden="true"
        >
          {FRIENDS_COPY.ringLabels[ring]}
        </span>
      ))}
      <div className="orbit-me" aria-hidden="true">
        {FRIENDS_COPY.me}
      </div>
      {orbit.map(({ person, daysSince, ring, angle }) => (
        <button
          key={person.id}
          type="button"
          className={person.id === overdueId ? 'orbit-person orbit-person-overdue' : 'orbit-person'}
          style={pointOnRing(ring, angle)}
          aria-label={FRIENDS_COPY.personWithSince(person.name, agoLabel(daysSince))}
          onClick={() => onOpen(person.id)}
        >
          {person.name}
        </button>
      ))}
    </div>
  )
}
