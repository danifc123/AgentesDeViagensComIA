import type { ClimateInfo } from '../../types'

export default function WeatherCard({ climate }: { climate?: ClimateInfo }) {
  const temp = climate?.temperature ?? '—'
  const feels = climate?.feels_like ?? '—'
  const cond = climate?.conditions ?? ''

  // Determine weather icon based on conditions
  const getWeatherIcon = () => {
    const lowerCond = cond.toLowerCase()
    if (lowerCond.includes('chuva') || lowerCond.includes('rain')) {
      return { icon: '🌧️', color: '#1a3a6c' } // Dark blue
    } else if (lowerCond.includes('sol') || lowerCond.includes('sun')) {
      return { icon: '☀️', color: '#ff9f43' } // Orange
    } else {
      return { icon: '☁️', color: '#94a3b8' } // Gray
    }
  }

  const weather = getWeatherIcon()

  return (
    <div className="weather-card">
      <div className="weather-left">
        <div className="weather-icon-container">
          <span className="weather-icon" style={{ color: weather.color }}>
            {weather.icon}
          </span>
        </div>
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
