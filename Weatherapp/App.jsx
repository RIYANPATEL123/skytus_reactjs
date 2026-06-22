import { useState } from 'react'
import axios from 'axios'

const API_KEY = '99d1da6d9b09de77e90a7e36cbad1be8'
const API_URL = 'https://api.openweathermap.org/data/2.5/weather'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchWeather = async () => {
    if (!city.trim()) return
    setLoading(true)
    setError('')
    setWeather(null)

    try {
      const response = await axios.get(API_URL, {
        params: { q: city, appid: API_KEY, units: 'metric' }
      })
      setWeather(response.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`City "${city}" not found. Please check the spelling.`)
      } else {
        setError('Something went wrong. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-primary bg-gradient d-flex align-items-center justify-content-center">
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card shadow-lg border-0 rounded-4 p-4">

          <h2 className="text-center fw-bold mb-1">🌤️ Weather App</h2>
          <p className="text-center text-muted mb-4">Search any city in the world</p>

          {/* Search Bar */}
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
            />
            <button className="btn btn-primary" onClick={fetchWeather} disabled={loading}>
              {loading
                ? <span className="spinner-border spinner-border-sm" />
                : 'Search'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger text-center">⚠️ {error}</div>
          )}

          {/* Weather Card */}
          {weather && (
            <div className="text-center mt-2">
              <h3 className="fw-bold">{weather.name}, {weather.sys.country}</h3>
              <p className="text-muted text-capitalize">{weather.weather[0].description}</p>

              <div className="display-1 fw-bold text-primary my-2">
                {Math.round(weather.main.temp)}°C
              </div>

              <div className="row g-3 mt-2 text-center">
                <div className="col-4">
                  <div className="bg-light rounded-3 p-3">
                    <div className="fw-bold">💧 {weather.main.humidity}%</div>
                    <small className="text-muted">Humidity</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="bg-light rounded-3 p-3">
                    <div className="fw-bold">🌬️ {Math.round(weather.wind.speed * 3.6)} km/h</div>
                    <small className="text-muted">Wind</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="bg-light rounded-3 p-3">
                    <div className="fw-bold">🌡️ {Math.round(weather.main.feels_like)}°C</div>
                    <small className="text-muted">Feels Like</small>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-muted small">
                Min: {Math.round(weather.main.temp_min)}°C &nbsp;|&nbsp; Max: {Math.round(weather.main.temp_max)}°C
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App