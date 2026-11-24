export function PageLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-[14px] pt-[42px] desk:px-[34px]" aria-busy="true" aria-live="polite">
      <div className="h-[12px] w-[180px] animate-pulse rounded bg-panel" />
      <div className="mt-[14px] h-[40px] w-full max-w-[520px] animate-pulse rounded bg-panel" />
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
