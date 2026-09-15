export function PropertyAmenities({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
      {amenities.map((amenity, i) => (
        <li
          key={`${i}-${amenity}`}
          className="flex items-baseline gap-3 border-b border-r border-rule px-4 py-3"
        >
          <span className="font-mono text-micro tabular-nums text-ink-faint">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-body text-ink">{amenity}</span>
        </li>
      ))}
    </ul>
  );
}
