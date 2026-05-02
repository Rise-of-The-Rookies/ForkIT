export default function TrendingPage() {
  return (
    <div className="px-5 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-1">Trending</h1>
      <p className="text-[var(--color-text-muted)] text-sm">What's hot right now</p>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-lg font-bold text-[#FF4D00] w-6">#{i + 1}</span>
            <div className="flex-1 h-16 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
