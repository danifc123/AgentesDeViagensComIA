import { useState } from 'react'
import type { HotelOption } from '../../types'

export default function HotelCarousel({ hotels }: { hotels: HotelOption[] }) {
  const [selected, setSelected] = useState<number | null>(null)

  // fallback: native horizontal scrollable list with selection (stable version)
  return (
    <div className="hotel-carousel" role="list">
      {hotels.map((hotel, idx) => (
        <div
          className={`hotel-slide ${selected === idx ? 'selected' : ''}`}
          key={idx}
          role="listitem"
          onClick={() => setSelected(idx)}
        >
          <div className={`hotel-card ${selected === idx ? 'selected' : ''}`}>
            <div className="hotel-image" />
            <div className="hotel-header">
              <div className="hotel-name">{hotel.name || 'Hotel'}</div>
              <div className="hotel-price">{hotel.total_price ? `R$ ${hotel.total_price}` : '—'}</div>
            </div>
            <div className="hotel-meta">{hotel.distance || ''}</div>
            {hotel.booking_url && (
              <a
                className="btn btn-small"
                href={String(hotel.booking_url)}
                target="_blank"
                rel="noreferrer"
              >
                Reservar
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
