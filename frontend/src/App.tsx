import React, { useState } from 'react'
import './App.css'

function App() {
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [data, setData] = useState('')
  const [orcamento, setOrcamento] = useState('')
  const [loading, setLoading] = useState(false)
  const [roteiro, setRoteiro] = useState('')

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
              <pre>{roteiro}</pre>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
