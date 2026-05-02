export default function FeedPage() {
  return (
    <div className="px-5 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-1">Feed</h1>
      <p className="text-[var(--color-text-muted)] text-sm">See what your friends are eating</p>
      <div className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
