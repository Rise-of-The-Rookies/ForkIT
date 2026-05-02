export default function DiscoverPage() {
  return (
    <div className="px-5 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-1">Discover</h1>
      <p className="text-[var(--color-text-muted)] text-sm">Find your next meal</p>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
