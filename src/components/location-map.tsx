// Real map for a report location. Uses the keyless Google Maps embed, so no
// map SDK or API key is needed; the address text is geocoded by Google.
export function LocationMap({ label, address, city }: { label: string; address: string; city?: string | null }) {
  const query = [address, city].filter(Boolean).join(", ");
  const q = encodeURIComponent(query);
  return (
    <figure className="overflow-hidden rounded-card border border-line bg-ink-raised">
      <iframe
        title={`${label}: ${query}`}
        src={`https://maps.google.com/maps?q=${q}&z=15&hl=id&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-[220px] w-full border-0 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.6)]"
      />
      <figcaption className="flex items-center justify-between gap-[12px] border-t border-line px-[14px] py-[10px]">
        <span className="min-w-0">
          <span className="block text-[11px] font-bold">{label}</span>
          <span className="block truncate text-[11px] text-muted">{query}</span>
        </span>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-[5px] border border-line px-[10px] py-[6px] text-[11px] font-semibold text-fg hover:border-line-strong"
        >
          Buka di Google Maps ↗
        </a>
      </figcaption>
    </figure>
  );
}
