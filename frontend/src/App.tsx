import React, { useState } from 'react'
import './App.css'
import Header from './components/ui/Header'
import Card from './components/ui/Card'
import WeatherCard from './components/ui/WeatherCard'
import FlightTable from './components/ui/FlightTable'
import HotelCarousel from './components/ui/HotelCarousel'
import BudgetCard from './components/ui/BudgetCard'
import TipsGrid from './components/ui/TipsGrid'
import HotelCard from './components/ui/HotelCard'
import { mockRoteiro } from './mockData'

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
    // Check for structured object with selected/alternatives
    if (flights.selected) items.push(flights.selected)
    if (Array.isArray(flights.alternatives)) items.push(...flights.alternatives)
    if (Array.isArray(flights.options)) items.push(...flights.options)
    if (items.length > 0) return items
    
    // Check if this is a single valid flight object (has airline, price, etc.)
    if (flights.airline || flights.price || flights.departure) {
      return [flights]
    }
    
    // Otherwise try to extract objects from values
    return Object.values(flights).filter((item) => item && typeof item === 'object' && (item as any).airline) as FlightOption[]
  }
  return []
}

const normalizeHotelList = (hotels: any): HotelOption[] => {
  if (!hotels) return []
  if (Array.isArray(hotels)) return hotels
  if (typeof hotels === 'object') {
    const items: HotelOption[] = []
    // Check for structured object with selected/alternatives
    if (hotels.selected) items.push(hotels.selected)
    if (Array.isArray(hotels.alternatives)) items.push(...hotels.alternatives)
    if (Array.isArray(hotels.options)) items.push(...hotels.options)
    if (items.length > 0) return items
    
    // Check if this is a single valid hotel object (has name, price, etc.)
    if (hotels.name || hotels.price_per_night || hotels.total_price) {
      return [hotels]
    }
    
    // Otherwise try to extract objects from values
    return Object.values(hotels).filter((item) => item && typeof item === 'object' && (item as any).name) as HotelOption[]
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
  const [origem, setOrigem] = useState('Rio Verde')
  const [destino, setDestino] = useState('Rio de Janeiro')
  const [data, setData] = useState('15 de Dezembro')
  const [orcamento, setOrcamento] = useState('5000')
  const [loading, setLoading] = useState(false)
  const [roteiro, setRoteiro] = useState<RoteiroData | string | null>(mockRoteiro) // Usar mock diretamente

  const renderInlineText = (text: string) => {
    const parts: React.ReactNode[] = []
    const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s]+)/g
    let lastIndex = 0
    let match: RegExpExecArray | null = null

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
      if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>)
      else if (match[4]) parts.push(<em key={match.index}>{match[4]}</em>)
      else if (match[6] && match[7]) parts.push(<a key={match.index} href={match[7]} target="_blank" rel="noreferrer">{match[6]}</a>)
      else if (match[8]) parts.push(<a key={match.index} href={match[8]} target="_blank" rel="noreferrer">{match[8]}</a>)
      lastIndex = regex.lastIndex
    }

    if (lastIndex < text.length) parts.push(text.slice(lastIndex))

    return <span>{parts}</span>
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
        <div className="trip-summary">
          <div className="trip-path">
            <span>{origin}</span>
            <span className="trip-arrow">→</span>
            <span>{destination}</span>
          </div>
          <div className="trip-date">{travelDate}</div>
        </div>

        <div className="structured-grid">
          <Card className="data-card">
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
          </Card>

          <Card className="data-card">
            <h3>Orçamento</h3>
            <BudgetCard budget={data.budget} />
          </Card>
        </div>

        {/* Weather card takes full width */}
        <Card className="data-card climate-card">
          <h3>Clima</h3>
          <WeatherCard climate={data.climate} />
        </Card>

        <Card className="data-card flights-card">
          <h3>Melhores Voos</h3>
          <FlightTable flights={flights} />
        </Card>

        <Card className="data-card hotels-card">
          <h3>Hospedagem</h3>
          <HotelCarousel hotels={hotels} />
        </Card>

        <Card className="data-card tips-card">
          <h3>Dicas & Recomendações</h3>
          <TipsGrid tips={data.tips} />
        </Card>
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
      <Header />
      
      <main className="main-content">
        {!roteiro ? (
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
        ) : (
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
