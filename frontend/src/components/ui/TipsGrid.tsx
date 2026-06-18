export default function TipsGrid({ tips }: { tips?: string[] }) {
  if (!tips || tips.length === 0) return <div className="empty">Sem dicas</div>
  return (
    <div className="tips-grid">
      {tips.map((t, i) => (
        <div className={`tip-card tip-${i % 4}`} key={i}>
          <div className="tip-icon">★</div>
          <div className="tip-body">
            <div className="tip-title">{t.split('—')[0] || 'Dica'}</div>
            <div className="tip-text">{t}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
