/**
 * Listing pictures are landlord-supplied free text — the API returns values
 * like "www.google.com". `next/image` throws on anything that is not an
 * absolute http(s) URL, so every src passes through here first.
 */
export function safeImageSrc(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function firstUsableImage(pictures: string[] | undefined): string | null {
  for (const picture of pictures ?? []) {
    const src = safeImageSrc(picture);
    if (src) return src;
  }
  return null;
}

export function usableImages(pictures: string[] | undefined): string[] {
  return (pictures ?? [])
    .map(safeImageSrc)
    .filter((src): src is string => src !== null);
}
