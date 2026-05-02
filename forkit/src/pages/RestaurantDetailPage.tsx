import { useParams } from 'react-router-dom'

export default function RestaurantDetailPage() {
  const { id } = useParams()

  return (
    <div className="px-5 pt-14 pb-6">
      <div className="w-full h-48 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-pulse mb-4" />
      <h1 className="text-2xl font-bold mb-1">Restaurant</h1>
      <p className="text-[var(--color-text-muted)] text-sm">ID: {id}</p>
    </div>
  )
}
