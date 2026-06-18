import React, { useState } from 'react'
import './App.css'

type MarkdownBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'subtitle'; text: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'hotel'; name: string; price?: string; attractions: string[] }
  | { type: 'spacer' }

interface MarkdownSection {
  title: string
  blocks: MarkdownBlock[]
}

interface RouteInfo {
  origem?: string
  destino?: string
  origin?: string
  destination?: string
  date?: string
  data?: string
  orcamento?: string | number
}

interface BudgetInfo {
  total?: string | number
  used?: string | number
  remaining?: string | number
  status?: string
}

interface ClimateInfo {
  location?: string
  temperature?: string
  feels_like?: string
  conditions?: string
  summary?: string
  recommendations?: string[]
}

interface FlightOption {
  airline?: string
  price?: string | number
  currency?: string
  departure?: string
  arrival?: string
  duration?: string
  purchase_url?: string
}

interface HotelOption {
  name?: string
  price_per_night?: string | number
  total_price?: string | number
  distance?: string
  attractions?: string[]
  currency?: string
  booking_url?: string
}

const normalizeFlightList = (flights: any): FlightOption[] => {
  if (!flights) return []
  if (Array.isArray(flights)) return flights
  if (typeof flights === 'object') {
    const items: FlightOption[] = []
    if (flights.selected) items.push(flights.selected)
    if (Array.isArray(flights.alternatives)) items.push(...flights.alternatives)
    if (Array.isArray(flights.options)) items.push(...flights.options)
    if (items.length > 0) return items
    return Object.values(flights).filter((item) => item && typeof item === 'object') as FlightOption[]
  }
  return []
}

const normalizeHotelList = (hotels: any): HotelOption[] => {
  if (!hotels) return []
  if (Array.isArray(hotels)) return hotels
  if (typeof hotels === 'object') {
    const items: HotelOption[] = []
    if (hotels.selected) items.push(hotels.selected)
    if (Array.isArray(hotels.alternatives)) items.push(...hotels.alternatives)
    if (Array.isArray(hotels.options)) items.push(...hotels.options)
    if (items.length > 0) return items
    return Object.values(hotels).filter((item) => item && typeof item === 'object') as HotelOption[]
  }
  return []
}

interface RoteiroData {
  route?: RouteInfo
  budget?: BudgetInfo
  climate?: ClimateInfo
  flights?: FlightOption[]
  hotels?: HotelOption[]
  tips?: string[]
  [key: string]: any
}

function App() {
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [data, setData] = useState('')
  const [orcamento, setOrcamento] = useState('')
  const [loading, setLoading] = useState(false)
  const [roteiro, setRoteiro] = useState<RoteiroData | string | null>(null)

  const renderInlineText = (text: string) => {
    const parts: React.ReactNode[] = []
    const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s]+)/g
    let lastIndex = 0
    let match: RegExpExecArray | null = null

    while (true) {
      match = regex.exec(text)
      if (match === null) break
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      if (match[2]) {
        parts.push(
          <strong key={match.index}>{match[2]}</strong>
        )
      } else if (match[4]) {
        parts.push(
          <em key={match.index}>{match[4]}</em>
        )
      } else if (match[6] && match[7]) {
        parts.push(
          <a key={match.index} href={match[7]} target="_blank" rel="noreferrer">
            {match[6]}
          </a>
        )
      } else if (match[8]) {
        parts.push(
          <a key={match.index} href={match[8]} target="_blank" rel="noreferrer">
            {match[8]}
          </a>
        )
      }

      lastIndex = regex.lastIndex
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts
  }

  function HotelCard({ name, price, attractions }: { name: string; price?: string; attractions: string[] }) {
    const [open, setOpen] = useState<Record<number, boolean>>({})

    return (
      <div className="hotel-card">
        <div className="hotel-header">
          <div className="hotel-name">{renderInlineText(name)}</div>
          {price && <div className="hotel-price">{renderInlineText(price)}</div>}
        </div>

        <div className="hotel-attractions">
          {attractions.slice(0, 3).map((a, i) => {
            const distanceMatch = a.match(/\(([^)]+km|[^)]+m|[^)]+km|[^)]+)\)/i)
            const distance = distanceMatch ? distanceMatch[1] : null
            const title = a.replace(/\s*\([^)]*\)\s*$/, '')
            return (
              <div className="attraction-item" key={i}>
                <div className="attraction-main">
                  <div className="attraction-title">{renderInlineText(title)}</div>
                  <button
                    className="attraction-btn"
                    onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
                    aria-expanded={open[i] ? 'true' : 'false'}
                  >
                    {open[i] ? 'Ocultar distância' : 'Ver distância'}
                  </button>
                </div>
                {open[i] && (
                  <div className="attraction-detail">
                    {distance ? `Distância: ${distance}` : 'Distância: não informada'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const parseMarkdown = (text: string): MarkdownSection[] => {
    const lines = text.split('\n')
    const sections: MarkdownSection[] = []
    let current: MarkdownSection = { title: 'Resumo', blocks: [] }

    const pushCurrent = () => {
      if (current.blocks.length || current.title) {
        sections.push(current)
      }
      current = { title: 'Resumo', blocks: [] }
    }

    const isSeparatorLine = (line: string) => {
      const normalized = line.replace(/\|/g, '').trim()
      return normalized.length > 0 && /^[-*_\s:]+$/.test(normalized)
    }

    const isTableLine = (line: string) => {
      if (!line.includes('|')) return false
      const withoutPipe = line.replace(/\|/g, '').trim()
      if (/^[-*_\s:]+$/.test(withoutPipe)) return false
      const parts = line.split('|').map((item) => item.trim())
      return parts.length >= 2 && parts.some((item) => item !== '')
    }

    let pendingList: string[] = []

    const flushList = () => {
      if (pendingList.length > 0) {
        current.blocks.push({ type: 'list', items: pendingList })
        pendingList = []
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      const trimmed = raw.trim()

      // Detect hotel header like '### 1. Hotel Name (Premium)' or '1. Hotel Name'
      const hotelMatch = trimmed.match(/^(?:#{1,6}\s*)?(\d+)\.\s*(.+)$/)
      if (hotelMatch) {
        flushList()
        // Close current section if it already has content
        if (current.blocks.length || current.title !== 'Resumo') pushCurrent()
        const name = hotelMatch[2].replace(/^\s*-+|\s*:+$/g, '')
        // collect following lines for price and attractions
        let price: string | undefined = undefined
        const attractions: string[] = []
        let j = i + 1
        for (; j < lines.length; j++) {
          const ln = lines[j].trim()
          if (!ln) break
          // stop if next hotel or section
          if (/^(?:#{1,6}\s*)?\d+\./.test(ln)) break
          if (ln.startsWith('## ') || ln.startsWith('# ')) break
          const priceMatch = ln.match(/^(?:\*\*)?Preço(?:\*\*)?[:\s]*([A-Za-z0-9\s$,.]+)/i)
          if (priceMatch) {
            price = priceMatch[1].trim()
            continue
          }
          if (/^[-*]\s+/.test(ln) || /^\d+\)\s+/.test(ln)) {
            const item = ln.replace(/^[-*]\s+|^\d+\)\s+/, '').trim()
            attractions.push(item)
            continue
          }
        }
        // push hotel block
        current = { title: 'Hospedagem', blocks: [] }
        current.blocks.push({ type: 'hotel', name: name, price: price, attractions })
        pushCurrent()
        i = j - 1
        continue
      }

      if (trimmed.startsWith('# ')) {
        flushList()
        if (current.blocks.length || current.title !== 'Resumo') pushCurrent()
        current = { title: trimmed.slice(2), blocks: [] }
      } else if (trimmed.startsWith('## ')) {
        flushList()
        current.blocks.push({ type: 'subtitle', text: trimmed.slice(3) })
      } else if (/^[-*]\s+/.test(trimmed)) {
        pendingList.push(trimmed.replace(/^[-*]\s+/, ''))
      } else if (trimmed === '') {
        flushList()
        current.blocks.push({ type: 'spacer' })
      } else if (isSeparatorLine(trimmed)) {
        flushList()
        current.blocks.push({ type: 'spacer' })
      } else if (isTableLine(trimmed)) {
        flushList()
        const row = trimmed
          .split('|')
          .map((cell) => cell.trim())
          .filter((cell) => cell !== '')
        current.blocks.push({ type: 'table', rows: [row] })
      } else {
        flushList()
        current.blocks.push({ type: 'paragraph', text: trimmed })
      }
    }

    flushList()
    pushCurrent()
    return sections
  }

  const renderStructuredRoteiro = (data: RoteiroData) => {
    const flights = normalizeFlightList(data.flights)
    const hotels = normalizeHotelList(data.hotels)
    const origin = data.route?.origem || data.route?.origin || 'Não informado'
    const destination = data.route?.destino || data.route?.destination || 'Não informado'
    const travelDate = data.route?.data || data.route?.date || 'Não informado'
    const travelBudget = data.route?.orcamento || data.budget?.total || 'Não informado'

    return (
      <div className="structured-roteiro">
        <div className="structured-grid">
          <article className="data-card">
            <h3>Detalhes da Viagem</h3>
            <div className="metric-row">
              <span>Origem</span>
              <strong>{origin}</strong>
            </div>
            <div className="metric-row">
              <span>Destino</span>
              <strong>{destination}</strong>
            </div>
            <div className="metric-row">
              <span>Data</span>
              <strong>{travelDate}</strong>
            </div>
            <div className="metric-row">
              <span>Orçamento</span>
              <strong>{travelBudget}</strong>
            </div>
          </article>

          <article className="data-card">
            <h3>Orçamento</h3>
            <div className="metric-row">
              <span>Total</span>
              <strong>{data.budget?.total || '—'}</strong>
            </div>
            <div className="metric-row">
              <span>Usado</span>
              <strong>{data.budget?.used || '—'}</strong>
            </div>
            <div className="metric-row">
              <span>Restante</span>
              <strong>{data.budget?.remaining || '—'}</strong>
            </div>
            <div className="metric-row">
              <span>Status</span>
              <strong>{data.budget?.status || '—'}</strong>
            </div>
          </article>

          <article className="data-card climate-card">
            <h3>Clima</h3>
            <div className="metric-row">
              <span>Local</span>
              <strong>{data.climate?.location || '—'}</strong>
            </div>
            <div className="metric-row">
              <span>Temperatura</span>
              <strong>{data.climate?.temperature || '—'}</strong>
            </div>
            <div className="metric-row">
              <span>Sensação</span>
              <strong>{data.climate?.feels_like || '—'}</strong>
            </div>
            <div className="metric-row">
              <span>Condições</span>
              <strong>{data.climate?.conditions || '—'}</strong>
            </div>
            {data.climate?.summary && <p>{renderInlineText(data.climate.summary)}</p>}
          </article>
        </div>

        <article className="data-card flights-card">
          <h3>Melhores Voos</h3>
          {flights.length > 0 ? (
            <div className="flights-table-wrapper">
              <table className="flights-table">
                <thead>
                  <tr>
                    <th>Companhia</th>
                    <th>Preço</th>
                    <th>Partida</th>
                    <th>Chegada</th>
                    <th>Duração</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((flight, index) => (
                    <tr key={index}>
                      <td>{flight.airline || '—'}</td>
                      <td>{flight.price ? `${flight.price} ${flight.currency || ''}` : '—'}</td>
                      <td>{flight.departure || '—'}</td>
                      <td>{flight.arrival || '—'}</td>
                      <td>{flight.duration || '—'}</td>
                      <td>
                        {flight.purchase_url ? (
                          <a href={String(flight.purchase_url)} target="_blank" rel="noreferrer">
                            Comprar
                          </a>
                        ) : (
                          'Sem link'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Não foi possível encontrar opções de voo estruturadas.</p>
          )}
        </article>

        <article className="data-card hotels-card">
          <h3>Hospedagem Sugerida</h3>
          {hotels.length > 0 ? (
            <div className="hotel-grid">
              {hotels.map((hotel, index) => (
                <div className="hotel-card" key={index}>
                  <div className="hotel-header">
                    <div className="hotel-name">{renderInlineText(hotel.name || 'Hotel')}</div>
                    <div className="hotel-price">{hotel.total_price ? `R$ ${hotel.total_price}` : '—'}</div>
                  </div>
                  <div className="metric-row">
                    <span>Preço / noite</span>
                    <strong>{hotel.price_per_night || '—'}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Distância</span>
                    <strong>{hotel.distance || '—'}</strong>
                  </div>
                  {hotel.attractions && hotel.attractions.length > 0 && (
                    <div className="hotel-attractions">
                      {hotel.attractions.slice(0, 3).map((attr, i) => (
                        <div className="attraction-item" key={i}>
                          {renderInlineText(attr)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Não foi possível encontrar opções de hotel estruturadas.</p>
          )}
        </article>

        <article className="data-card tips-card">
          <h3>Dicas & Recomendações</h3>
          {data.tips && data.tips.length > 0 ? (
            <ul>
              {data.tips.map((tip, index) => (
                <li key={index}>{renderInlineText(tip)}</li>
              ))}
            </ul>
          ) : (
            <p>Sem dicas adicionais no momento.</p>
          )}
        </article>
      </div>
    )
  }

  const renderMarkdown = (text: string) => {
    const sections = parseMarkdown(text)
    return sections.map((section, index) => (
      <article className="markdown-section-card" key={`section-${index}`}>
        {section.title && <h3>{section.title}</h3>}
        {section.blocks.map((block, blockIndex) => {
          if (block.type === 'paragraph') {
            const kvMatch = block.text.match(/^\*\*(.+?)\*\*:\s*(.+)$/)
            if (kvMatch) {
              return (
                <div key={blockIndex} className="markdown-key-value">
                  <span className="kv-key">{renderInlineText(kvMatch[1])}</span>
                  <span className="kv-separator">:</span>
                  <span className="kv-value">{renderInlineText(kvMatch[2])}</span>
                </div>
              )
            }
            return <p key={blockIndex}>{renderInlineText(block.text)}</p>
          }
          if (block.type === 'hotel') {
            const h = block as MarkdownBlock & { type: 'hotel'; name: string; price?: string; attractions: string[] }
            return (
              <div key={blockIndex}>
                <HotelCard name={h.name} price={h.price} attractions={h.attractions || []} />
              </div>
            )
          }
          if (block.type === 'subtitle') {
            return <h4 key={blockIndex}>{block.text}</h4>
          }
          if (block.type === 'list') {
            return (
              <ul key={blockIndex}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInlineText(item)}</li>
                ))}
              </ul>
            )
          }
          if (block.type === 'table') {
            return (
              <div key={blockIndex} className="markdown-table-wrapper">
                <table>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{renderInlineText(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
          return <div key={blockIndex} className="spacer" />
        })}
      </article>
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setRoteiro('')

    try {
      const response = await fetch('http://localhost:8000/gerar-roteiro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origem,
          destino,
          data,
          orcamento: parseFloat(orcamento)
        }),
      })

      const result = await response.json()
      setRoteiro(result.roteiro)
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error)
      setRoteiro('Houve um erro ao gerar o roteiro. Verifique se o backend está rodando e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>✈️ IAgent de Viagens</h1>
        <p>Seu assistente inteligente para planejar a viagem perfeita</p>
      </header>

      <main className="main-content">
        <section className="form-section">
          <form onSubmit={handleSubmit} className="travel-form">
            <div className="input-group">
              <label htmlFor="origem">Origem</label>
              <input
                id="origem"
                type="text"
                placeholder="Ex: São Paulo"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="destino">Destino</label>
              <input
                id="destino"
                type="text"
                placeholder="Ex: Paris"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="data">Data da Viagem</label>
              <input
                id="data"
                type="text"
                placeholder="Ex: 15 de Dezembro"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="orcamento">Orçamento (R$)</label>
              <input
                id="orcamento"
                type="number"
                placeholder="Ex: 5000"
                value={orcamento}
                onChange={(e) => setOrcamento(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <span className="loader">Planejando...</span>
              ) : (
                'Gerar Meu Roteiro'
              )}
            </button>
          </form>
        </section>

        {roteiro && (
          <section className="result-section">
            <h2>🗺️ Seu Roteiro Inteligente</h2>
            {typeof roteiro === 'object' ? (
              <div className="structured-body">{renderStructuredRoteiro(roteiro)}</div>
            ) : (
              <div className="markdown-body">{renderMarkdown(String(roteiro))}</div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
