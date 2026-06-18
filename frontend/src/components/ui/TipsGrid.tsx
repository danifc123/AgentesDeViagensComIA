import type { Tip } from '../../types'

// Icon components using emoji for simplicity (easily replaceable with SVG)
const tipIcons: Record<Tip['category'], { icon: string; color: string }> = {
  restaurant: { icon: '🍴', color: 'text-orange-400' },
  tourist_spot: { icon: '🏛️', color: 'text-purple-400' },
  nature: { icon: '🌳', color: 'text-green-400' },
  nightlife: { icon: '🌙', color: 'text-pink-400' },
}

const tipLabels: Record<Tip['category'], string> = {
  restaurant: 'Restaurante Top',
  tourist_spot: 'Ponto Turístico',
  nature: 'Conecte-se à Natureza',
  nightlife: 'Vida Noturna',
}

export default function TipsGrid({ tips }: { tips?: Tip[] | string[] }) {
  if (!tips || tips.length === 0) return <div className="empty">Sem dicas</div>

  // Handle both structured Tip[] and legacy string[]
  const processedTips: Tip[] = (tips as any[]).map((tip): Tip => {
    if (typeof tip === 'string') {
      // Fallback for legacy string tips
      const categories: Tip['category'][] = ['restaurant', 'tourist_spot', 'nature', 'nightlife']
      const index = (tips as any[]).indexOf(tip)
      return {
        category: categories[index % 4],
        title: tip.split('—')[0] || tip,
        description: tip,
      }
    }
    return tip
  })

  return (
    <div className="tips-grid">
      {processedTips.slice(0, 4).map((tip, idx) => {
        const { icon } = tipIcons[tip.category] || tipIcons.tourist_spot
        const label = tipLabels[tip.category] || 'Dica'

        return (
          <div className={`tip-card tip-${tip.category}`} key={idx}>
            <div className="tip-header">
              <div className="tip-icon">{icon}</div>
              <div className="tip-category">{label}</div>
            </div>
            <div className="tip-body">
              <div className="tip-title">{tip.title}</div>
              {tip.description && <div className="tip-text">{tip.description}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
