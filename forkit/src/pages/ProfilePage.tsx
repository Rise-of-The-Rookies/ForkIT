export default function ProfilePage() {
  return (
    <div className="px-5 pt-14 pb-6 flex flex-col items-center">
      <div className="size-24 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] mt-6 animate-pulse" />
      <h1 className="text-2xl font-bold mt-4 mb-1">Profile</h1>
      <p className="text-[var(--color-text-muted)] text-sm">Your food journey</p>
      <div className="mt-8 w-full space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
