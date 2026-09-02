import Image from "next/image";
import Link from "next/link";
import { Dot } from "@/shared/ui";
import { formatRent } from "@/shared/lib/format";
import { firstUsableImage } from "@/shared/lib/image";
import { cn } from "@/shared/lib/cn";
import type { Property } from "@/shared/types";

export function PropertyCard({
  property,
  index,
  priority,
  className,
}: {
  property: Property;
  index?: number;
  priority?: boolean;
  className?: string;
}) {
  const cover = firstUsableImage(property.pictures);

  return (
    <article
      className={cn(
        "group relative flex flex-col border border-rule bg-surface transition-colors duration-200 hover:border-ink",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink/[0.06]">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-micro uppercase tracking-label text-ink-faint">
            No photo
          </span>
        )}

        {index !== undefined && (
          <span className="absolute left-0 top-0 bg-paper px-2 py-1 font-mono text-micro tabular-nums text-ink-muted">
            {String(index).padStart(2, "0")}
          </span>
        )}

        {!property.isAvailable && (
          <span className="absolute right-0 top-0 bg-ink px-2 py-1 text-micro uppercase tracking-label text-paper">
            Let
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="flex items-center gap-2 text-micro uppercase tracking-label text-ink-muted">
          <Dot tone={property.isAvailable ? "positive" : "neutral"} />
          {property.location}
        </p>

        <h3 className="text-h4 leading-snug text-ink">
          <Link
            href={`/properties/${property.id}`}
            className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {property.title}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-rule pt-3">
          <span className="text-micro uppercase tracking-label text-ink-faint">
            {property.category}
          </span>
          <span className="font-mono text-lead tabular-nums leading-none text-ink">
            {formatRent(property.price)}
            <span className="ml-1 text-micro text-ink-faint">/mo</span>
          </span>
        </div>
      </div>
    </article>
  );
}
