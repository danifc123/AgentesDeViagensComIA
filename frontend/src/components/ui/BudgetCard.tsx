import type { FlightOption, HotelOption } from '../../types'

interface BudgetCardProps {
  userBudget: number
  suggestedFlight?: FlightOption
  suggestedHotel?: HotelOption
}

export default function BudgetCard({ userBudget, suggestedFlight, suggestedHotel }: BudgetCardProps) {
  // Get prices from suggestions
  const flightPrice = Number(suggestedFlight?.price) || 0
  const hotelPrice = Number(suggestedHotel?.total_price) || 0
  
  const totalUsed = flightPrice + hotelPrice
  const remaining = userBudget - totalUsed
  const percentUsed = userBudget > 0 ? Math.round((totalUsed / userBudget) * 100) : 0
  
  // Determine status
  const isWithinBudget = remaining >= 0
  const statusText = isWithinBudget ? 'Dentro do orçamento' : 'Acima do orçamento'

  return (
    <div className="budget-card">
      <div className="budget-bar">
        <div 
          className={`budget-fill ${!isWithinBudget ? 'over' : ''}`} 
          style={{ width: `${Math.min(percentUsed, 100)}%` }} 
        />
      </div>
      <div className="budget-values">
        <div className="kv"><span>Voo</span><strong>R$ {flightPrice || '—'}</strong></div>
        <div className="kv"><span>Hotel</span><strong>R$ {hotelPrice || '—'}</strong></div>
        <div className="kv"><span>Restante</span><strong>R$ {remaining >= 0 ? remaining : 0}</strong></div>
      </div>
      <div className={`budget-status ${isWithinBudget ? 'ok' : 'over'}`}>
        {statusText}
      </div>
    </div>
  )
}
