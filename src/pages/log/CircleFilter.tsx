import { circlesToOffer } from '../../domain/circles'
import type { Circle } from '../../domain/types'
import { LOG_COPY } from './copy'
import { Chip, LabelledChipGroup } from './Panel'

interface CircleFilterProps {
  circles: Circle[]
  selectedId: string | undefined
  onSelect: (circleId: string | undefined) => void
}

export function CircleFilter({ circles, selectedId, onSelect }: CircleFilterProps) {
  const offered = circlesToOffer(circles)

  if (offered.length === 0) {
    return null
  }

  return (
    <LabelledChipGroup label={LOG_COPY.circle}>
      <Chip label={LOG_COPY.everyone} pressed={selectedId === undefined} onClick={() => onSelect(undefined)} />
      {offered.map((circle) => (
        <Chip
          key={circle.id}
          label={circle.name}
          pressed={circle.id === selectedId}
          onClick={() => onSelect(circle.id)}
        />
      ))}
    </LabelledChipGroup>
  )
}
