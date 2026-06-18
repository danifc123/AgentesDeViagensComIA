import type { BudgetInfo } from '../../types'

export default function BudgetCard({ budget }: { budget?: BudgetInfo }) {
  const percent = budget?.total ? Math.round(((Number(budget.used || 0) / Number(budget.total)) * 100)) : 0
  return (
    <div className="budget-card">
      <div className="budget-bar">
        <div className="budget-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="budget-values">
        <div className="kv"><span>Voo</span><strong>R$ {budget?.used ?? '—'}</strong></div>
        <div className="kv"><span>Hotel</span><strong>R$ {budget?.total ?? '—'}</strong></div>
        <div className="kv"><span>Restante</span><strong>R$ {budget?.remaining ?? '—'}</strong></div>
      </div>
      <div className={`budget-status ${budget?.status === 'within_budget' ? 'ok' : 'over'}`}>
        {budget?.status === 'within_budget' ? 'Dentro do orçamento' : 'Acima do orçamento'}
      </div>
    </div>
  )
}
