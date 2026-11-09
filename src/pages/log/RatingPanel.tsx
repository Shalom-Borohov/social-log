import { RatingDots } from '../../components/RatingDots'
import { MEETUP_COPY } from '../../copy/meetup'
import { RATINGS, type Rating } from '../../domain/types'
import { LOG_COPY } from './copy'
import { Panel } from './Panel'

interface RatingPanelProps {
  rating: Rating | undefined
  onPick: (rating: Rating) => void
}

export function RatingPanel({ rating, onPick }: RatingPanelProps) {
  return (
    <Panel heading={LOG_COPY.panelHeadings.rating}>
      <div className="log-ratings" role="group" aria-label={LOG_COPY.panelHeadings.rating}>
        {RATINGS.map((option) => (
          <button
            key={option}
            type="button"
            className={`log-rating rating-${option}`}
            aria-pressed={rating === option}
            onClick={() => onPick(option)}
          >
            {MEETUP_COPY.ratings[option]}
            <RatingDots rating={option} />
          </button>
        ))}
      </div>
    </Panel>
  )
}
