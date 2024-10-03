document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '0b5b96f182msh5249495fbd653ddp1d8eb6jsn839d36067752'  // Clave API
    const apiUrl = 'https://rapidweather.p.rapidapi.com/data/2.5/forecast?id=524901' // Endpoint de la API

    // Elementos del DOM
    const searchInput = document.querySelector('.search-city input')
    const searchButton = document.querySelector('.btn_search')
    const cityElement = document.querySelector('.current-weather .city')
    const temperatureElement = document.querySelector('.current-weather .temperature')
    const dateTimeElement = document.querySelector('.current-weather .date-time')
    const weatherIconElement = document.querySelector('.current-weather img')
    const forecastElement = document.querySelector('.forecast')
    const hourlyForecastElement = document.querySelector('.hourly-forecast')
    const highlightsElements = document.querySelectorAll('.today-highlights .highlight')
    const populationElement = document.querySelector('.popullation')

    // Función para hacer una solicitud a la API
    const fetchWeatherData = async (city) => {
        try {
            const response = await fetch(`${apiUrl}&q=${city}`, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': 'rapidweather.p.rapidapi.com'
                }
            })

            if (!response.ok) throw new Error('Failed to fetch weather data')

            return await response.json()
        } catch (error) {
            console.error(error)
            alert('Error al obtener los datos del clima.')
        }
    }

    // Función para actualizar los datos del clima
    const updateWeather = async (city) => {
        const weatherData = await fetchWeatherData(city)
        if (!weatherData) return

        const current = weatherData.list[0]  // Primer bloque de pronóstico actual

        // Actualización de clima actual
        cityElement.textContent = `${weatherData.city.name}, ${weatherData.city.country}`
        temperatureElement.textContent = kelvinToCelsius(current.main.temp)
        dateTimeElement.textContent = formatDate(current.dt_txt)
        populationElement.textContent = `Population: ${weatherData.city.population} Habitants`
        weatherIconElement.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}.png`

        // Actualización de pronóstico diario
        updateForecast(weatherData.list.filter((_, i) => i % 8 === 0))

        // Actualización de pronóstico por horas
        updateHourlyForecast(weatherData.list.slice(0, 6))

        // Actualización de los datos destacados del día
        updateHighlights(current, weatherData.city.sunrise)
    }

    // Actualiza el pronóstico diario
    const updateForecast = (days) => {
        forecastElement.innerHTML = ''
        days.forEach(day => {
            const forecastDay = document.createElement('div')
            forecastDay.classList.add('forecast-day')
            forecastDay.innerHTML = `
                <div>${formatDate(day.dt_txt, true)}</div>
                <div>${day.weather[0].description}</div>
            `
            forecastElement.appendChild(forecastDay)
        })
    }

    // Actualiza el pronóstico por horas
    const updateHourlyForecast = (hours) => {
        hourlyForecastElement.innerHTML = ''
        hours.forEach(hour => {
            const forecastHour = document.createElement('div')
            forecastHour.classList.add('hour')
            forecastHour.innerHTML = `
                <div>${formatHour(hour.dt_txt)}</div>
                <div>${kelvinToCelsius(hour.main.temp)}</div>
                <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
            `
            hourlyForecastElement.appendChild(forecastHour)
        })
    }

    // Actualiza los datos destacados (resumen del día)
    const updateHighlights = (current, sunrise) => {
        const [pressure, windSpeed, sunriseElement, humidity, visibility] = highlightsElements

        pressure.querySelector('p').textContent = `${current.main.pressure} hPa`
        windSpeed.querySelector('p').textContent = `${current.wind.speed} Km/h`
        sunriseElement.querySelector('p').textContent = `${formatHour(sunrise)} AM`
        humidity.querySelector('p').textContent = `${current.main.humidity}%`
        visibility.querySelector('p').textContent = `${current.visibility / 1000} Km`
    }

    // Conversión de Kelvin a Celsius
    const kelvinToCelsius = (kelvin) => {
        return `${(kelvin - 273.15).toFixed(1)}°C`
    }

    // Formato de fecha
    const formatDate = (dateStr, short = false) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        return new Date(dateStr).toLocaleDateString(undefined, short ? { month: 'short', day: 'numeric' } : options)
    }

    // Formato de hora
    const formatHour = (dateStr) => {
        return new Date(dateStr).getHours() + ':00'
    }

    // Eventos para búsqueda de clima
    searchButton.addEventListener('click', () => updateWeather(searchInput.value))
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') updateWeather(searchInput.value)
    })

    // Clima por defecto
    // updateWeather('Srinagar')
})
