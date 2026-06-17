import React, { useState } from 'react'
import './App.css'

type MarkdownBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'subtitle'; text: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'spacer' }

interface MarkdownSection {
  title: string
  blocks: MarkdownBlock[]
}

function App() {
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [data, setData] = useState('')
  const [orcamento, setOrcamento] = useState('')
  const [loading, setLoading] = useState(false)
  const [roteiro, setRoteiro] = useState('')

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

    const isTableLine = (line: string) => {
      const parts = line.split('|').map((item) => item.trim())
      return parts.length >= 3 && parts.some((item) => item !== '')
    }

    let pendingList: string[] = []

    const flushList = () => {
      if (pendingList.length > 0) {
        current.blocks.push({ type: 'list', items: pendingList })
        pendingList = []
      }
    }

    lines.forEach((line) => {
      const trimmed = line.trim()

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
    })

    flushList()
    pushCurrent()
    return sections
  }

  const renderMarkdown = (text: string) => {
    const sections = parseMarkdown(text)
    return sections.map((section, index) => (
      <article className="markdown-section-card" key={`section-${index}`}>
        {section.title && <h3>{section.title}</h3>}
        {section.blocks.map((block, blockIndex) => {
          if (block.type === 'paragraph') {
            return <p key={blockIndex}>{block.text}</p>
          }
          if (block.type === 'subtitle') {
            return <h4 key={blockIndex}>{block.text}</h4>
          }
          if (block.type === 'list') {
            return (
              <ul key={blockIndex}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
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
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
          return <div key={blockIndex} style={{ height: '1rem' }} />
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
            <div className="markdown-body">
              {renderMarkdown(roteiro)}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
