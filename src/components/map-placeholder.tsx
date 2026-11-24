// Static stand-in for the map drawn in Figma (no map provider in phase 1).
export function MapPlaceholder({ label, address }: { label: string; address: string }) {
  return (
    <div className="relative h-[170px] overflow-hidden rounded-card border border-line bg-ink-raised" role="img" aria-label={`${label}: ${address}`}>
      <svg className="absolute inset-0 size-full" viewBox="0 0 490 170" preserveAspectRatio="none" aria-hidden>
        <path d="M0 105 L490 15" stroke="#1f1f23" strokeWidth="9" />
        <path d="M0 20 L330 170" stroke="#1f1f23" strokeWidth="9" />
        <path d="M265 0 L250 170" stroke="#1f1f23" strokeWidth="7" />
      </svg>
      <span className="absolute left-1/2 top-1/2 size-[34px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg" />
      <span className="absolute left-[calc(50%+28px)] top-1/2 -translate-y-1/2 rounded-[6px] border border-line bg-panel px-[10px] py-[6px]">
        <span className="block text-[11px] font-bold">{label}</span>
        <span className="block text-[10px] text-muted">{address}</span>
      </span>
    </div>
  );
}
