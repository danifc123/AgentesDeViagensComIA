export default function HotelCard({ name, price, attractions }: { name: string; price?: string; attractions: any[] }) {
  const displayAttrs = Array.isArray(attractions)
    ? attractions.map(a => (typeof a === 'string' ? a : a.name || JSON.stringify(a)))
    : []

  return (
    <div className="hotel-card">
      <div className="hotel-header">
        <div className="hotel-name">{name}</div>
        <div className="hotel-price">{price || '—'}</div>
      </div>
      {displayAttrs && displayAttrs.length > 0 && (
        <div className="hotel-attractions">
          {displayAttrs.slice(0, 3).map((a, i) => (
            <div className="attraction-item" key={i}>{a}</div>
          ))}
        </div>
      )}
    </div>
  )
}
