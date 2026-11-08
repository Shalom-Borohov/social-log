import type { Rating } from '../domain/types'

export function RatingDots({ rating }: { rating: Rating }) {
  return (
    <span className="rating-dots" aria-hidden="true">
      {Array.from({ length: rating }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  )
}
