import type { ClimateInfo } from '../../types'

export default function WeatherCard({ climate }: { climate?: ClimateInfo }) {
  const temp = climate?.temperature ?? '—'
  const feels = climate?.feels_like ?? '—'
  const cond = climate?.conditions ?? ''

  return (
    <div className="weather-card">
      <div className="weather-left">
        <div className="weather-temp">{temp}°</div>
        <div className="weather-feels">Sensação: {feels}°C</div>
        <div className="weather-cond">{cond}</div>
        <div className="temp-bar">
          <div className="temp-fill" style={{ width: '40%' }} />
        </div>
      </div>

      <div className="weather-right">
        {climate?.recommendations?.map((r, i) => (
          <div className="weather-tip" key={i}>
            <div className="tip-icon">▣</div>
            <div className="tip-body">
              <div className="tip-title">{r}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
