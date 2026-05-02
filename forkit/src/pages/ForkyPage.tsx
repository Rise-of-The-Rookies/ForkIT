export default function ForkyPage() {
  return (
    <div className="px-5 pt-14 pb-6 flex flex-col items-center">
      <div className="size-20 rounded-full bg-[#FF4D00]/15 flex items-center justify-center mb-4 mt-8">
        <span className="text-4xl">🤖</span>
      </div>
      <h1 className="text-2xl font-bold mb-1">Forky</h1>
      <p className="text-[var(--color-text-muted)] text-sm text-center max-w-xs">
        Your AI food companion — ask me anything about what to eat!
      </p>
      <div className="mt-10 w-full max-w-sm h-12 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-pulse" />
    </div>
  )
}
