import { formatDate } from "@/shared/lib/format";
import type { Review } from "@/shared/types";
import { RatingStars } from "./rating-stars";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const mean =
    reviews.reduce((total, review) => total + review.rating, 0) /
    reviews.length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-y border-ink py-5">
        <p className="flex items-baseline gap-2">
          <span className="font-mono text-h1 tabular-nums leading-none text-ink">
            {mean.toFixed(1)}
          </span>
          <span className="font-mono text-meta tabular-nums text-ink-faint">
            / 5
          </span>
        </p>
        <p className="text-micro uppercase tracking-label text-ink-faint">
          <span className="font-mono tabular-nums text-ink-muted">
            {String(reviews.length).padStart(2, "0")}
          </span>{" "}
          {reviews.length === 1 ? "review" : "reviews"} from completed tenancies
        </p>
      </div>

      <ul>
        {reviews.map((review, i) => (
          <li
            key={review.id}
            className="grid gap-x-6 gap-y-3 border-b border-rule py-6 sm:grid-cols-4"
          >
            <div className="sm:col-span-1">
              <p className="flex items-baseline gap-2.5 text-body text-ink">
                <span className="font-mono text-micro tabular-nums text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {review.user?.name ?? "Tenant"}
              </p>
              <p className="mt-1 pl-7 font-mono text-micro tabular-nums text-ink-faint">
                {formatDate(review.createdAt)}
              </p>
            </div>

            <div className="sm:col-span-3">
              <RatingStars rating={review.rating} />
              <p className="mt-2 max-w-prose text-body text-ink-muted">
                {review.review}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
