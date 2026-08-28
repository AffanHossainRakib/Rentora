const UNIT_TO_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const;

export const parseDurationToMs = (value: string | number): number => {
  if (typeof value === "number") {
    return value * 1000;
  }

  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());

  if (!match) {
    throw new Error(
      `Invalid duration "${value}". Expected a number followed by s, m, h, or d (e.g. "15m", "1d").`,
    );
  }

  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof UNIT_TO_MS;
  return amount * UNIT_TO_MS[unit];
};
