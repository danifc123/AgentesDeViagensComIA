import { useState } from 'react'
import type { HotelOption } from '../../types'

export default function HotelCarousel({ hotels }: { hotels: HotelOption[] }) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleSlideClick = (idx: number, e: React.MouseEvent) => {
    // If click is on a link, don't select the slide
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    setSelected(idx);
  }

  // fallback: native horizontal scrollable list with selection (stable version)
  return (
    <div className="hotel-carousel" role="list">
      {hotels.map((hotel, idx) => (
        <div
          className={`hotel-slide ${selected === idx ? 'selected' : ''}`}
          key={idx}
          role="listitem"
          onClick={(e) => handleSlideClick(idx, e)}
        >
          <div className={`hotel-card ${selected === idx ? 'selected' : ''}`}>
            <div className="hotel-header">
              <div className="hotel-name">{hotel.name || 'Hotel'}</div>
              <div className="hotel-price">{hotel.total_price ? `R$ ${hotel.total_price}` : '—'}</div>
            </div>
            <div className="hotel-distance">{hotel.distance || ''}</div>
            {/* Nearby places as bullet points */}
            {hotel.attractions && hotel.attractions.length > 0 && (
              <div className="nearby-places">
                {(Array.isArray(hotel.attractions) ? hotel.attractions : [])
                  .slice(0, 3)
                  .map((attr, i) => {
                    const placeName = typeof attr === 'string' ? attr : attr.name || ''
                    if (placeName) {
                      return (
                        <div key={i} className="nearby-place">
                          <span className="bullet">•</span>
                          <span>{placeName}</span>
                        </div>
                      )
                    }
                    return null
                  })}
              </div>
            )}
            {hotel.booking_url && (
              <a className="btn btn-small" href={String(hotel.booking_url)} target="_blank" rel="noreferrer">
                Reservar
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
