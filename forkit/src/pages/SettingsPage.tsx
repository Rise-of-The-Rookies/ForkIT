export default function SettingsPage() {
  return (
    <div className="px-5 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-[var(--color-text-muted)] text-sm">Preferences &amp; account</p>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
