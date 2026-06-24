import { useState } from 'react'
import type { FlightOption } from '../../types'

interface FlightTableProps {
  flights?: FlightOption[]
}

export default function FlightTable({ flights = [] }: FlightTableProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!flights || flights.length === 0) {
    return (
      <div className="flights-table-container">
        <div className="empty-state">
          <p>Nenhum voo disponível</p>
        </div>
      </div>
    )
  }

  const handleRowKeyDown = (index: number, e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedIndex(selectedIndex === index ? null : index)
    }
  }

  return (
    <div className="flights-table-container">
      <table className="flights-table">
        <thead>
          <tr>
            <th>Companhia</th>
            <th>Saída</th>
            <th>Chegada</th>
            <th>Duração</th>
            <th>Preço</th>
            {/* <th>Ação</th> */}
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, index) => (
            <tr
              key={index}
              className={selectedIndex === index ? 'selected' : ''}
              tabIndex={0}
              aria-label={`Voo ${flight.airline} - ${flight.price}`}
              onKeyDown={(e) => handleRowKeyDown(index, e)}
              onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
            >
              <td className="airline">{flight.airline || '—'}</td>
              <td className="departure">{flight.departure || '—'}</td>
              <td className="arrival">{flight.arrival || '—'}</td>
              <td className="duration">{flight.duration || '—'}</td>
              <td className="price">
                {flight.price ? `${flight.price}${flight.currency ? ` ${flight.currency}` : ''}` : '—'}
              </td>
              {/* <td className="action">
                {flight.purchase_url ? (
                  <a
                    href={flight.purchase_url}
                    target="_blank"
                    rel="noreferrer"
                    className="buy-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Comprar
                  </a>
                ) : (
                  <span className="no-link">—</span>
                )}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
