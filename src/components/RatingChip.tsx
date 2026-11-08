import type { Rating } from '../domain/types'
import { RatingDots } from './RatingDots'

export function RatingChip({ rating }: { rating: Rating }) {
  return (
    <span className={`rating-chip rating-${rating}`} aria-hidden="true">
      <RatingDots rating={rating} />
    </span>
  )
}
