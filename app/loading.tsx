export default function Loading() {
  return (
    <main className="marketplace-shell min-h-screen bg-white" aria-busy="true">
      <p className="vs-sr-only">Loading VibeShift…</p>
      <div className="marketplace-header sticky top-0 z-50">
        <div className="mx-auto flex min-h-[62px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <span className="text-xl font-extrabold tracking-tight text-neutral-900">
            vibe<span className="text-cyan-600">shift</span>
          </span>
          <span className="vs-skeleton h-9 w-28" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="vs-skeleton h-11 w-[78%] max-w-xl" />
        <div className="vs-skeleton mt-3 h-11 w-[52%] max-w-md" />
        <div className="vs-skeleton mt-7 h-4 w-full max-w-lg" />
        <div className="vs-skeleton mt-3 h-4 w-2/3 max-w-sm" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="vs-skeleton h-52" />
          <div className="vs-skeleton h-52" />
          <div className="vs-skeleton h-52" />
        </div>
      </div>
    </main>
  );
}
