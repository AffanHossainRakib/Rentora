"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { usableImages } from "@/shared/lib/image";

export function PropertyGallery({
  pictures: raw,
  title,
}: {
  pictures: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const pictures = usableImages(raw);

  if (pictures.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center border border-rule bg-ink/[0.06] text-micro uppercase tracking-label text-ink-faint">
        No photos for this listing
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[16/10] overflow-hidden border border-rule bg-ink/[0.06]">
        <Image
          key={pictures[active]}
          src={pictures[active]}
          alt={`${title} — view ${active + 1} of ${pictures.length}`}
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover"
        />
        <p className="absolute bottom-0 left-0 bg-paper px-2.5 py-1 font-mono text-micro tabular-nums text-ink">
          {String(active + 1).padStart(2, "0")}
          <span className="mx-1 text-ink-faint">/</span>
          {String(pictures.length).padStart(2, "0")}
        </p>
      </div>

      {pictures.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {pictures.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block aspect-[4/3] w-full overflow-hidden border transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  i === active
                    ? "border-ink"
                    : "border-rule opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="12vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
