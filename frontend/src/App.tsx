import React, { useState } from 'react'
import './App.css'

function App() {
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [data, setData] = useState('')
  const [orcamento, setOrcamento] = useState('')
  const [loading, setLoading] = useState(false)
  const [roteiro, setRoteiro] = useState('')

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const formatMarkdown = (text: string) => {
    const lines = text.split('\n')
    let html = ''
    let inList = false

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('# ')) {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        html += `<h2>${escapeHtml(trimmed.slice(2))}</h2>`
      } else if (trimmed.startsWith('## ')) {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        html += `<h3>${escapeHtml(trimmed.slice(3))}</h3>`
      } else if (trimmed.startsWith('### ')) {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        html += `<h4>${escapeHtml(trimmed.slice(4))}</h4>`
      } else if (/^[-*]\s+/.test(trimmed)) {
        if (!inList) {
          html += '<ul>'
          inList = true
        }
        html += `<li>${escapeHtml(trimmed.replace(/^[-*]\s+/, ''))}</li>`
      } else if (trimmed === '') {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        html += '<br/>'
      } else {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        html += `<p>${escapeHtml(trimmed)}</p>`
      }
    })

    if (inList) html += '</ul>'
    return html
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
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(roteiro) }}
            />
          </section>
        )}
      </main>
    </div>
  )
}

export default App
