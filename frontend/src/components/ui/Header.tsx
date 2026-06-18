export default function Header() {
  return (
    <header className="header">
      <h1>✈️ IAgent de Viagens</h1>
      <p>Seu assistente inteligente para planejar a viagem perfeita</p>
      <div className="agents-flow">
        <span className="agent-chip agent-blue"><span className="dot" />Agente Pesquisador</span>
        <span className="flow-arrow">→</span>
        <span className="agent-chip agent-teal"><span className="dot" />Agente Analista</span>
        <span className="flow-arrow">→</span>
        <span className="agent-chip agent-amber"><span className="dot" />Agente Consultor</span>
      </div>
    </header>
  )
}
