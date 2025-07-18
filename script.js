document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '3f5cf2900d46ab910ae2b474d051af34'; // Replace with your actual OpenWeatherMap API key
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const currentWeatherDiv = document.getElementById('current-weather');
    const forecastContainer = document.getElementById('forecast-container');
    const majorCitiesList = document.getElementById('major-cities-list');

    const defaultMajorCities = [
        "New Delhi", "Mumbai", "London", "New York", "Tokyo",
        "Paris", "Sydney", "Dubai", "Rio de Janeiro", "Cairo"
    ];

    // Function to fetch weather data for a given city
    async function getWeatherData(city) {
        try {
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

            const [currentWeatherRes, forecastRes] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(forecastUrl)
            ]);

            if (!currentWeatherRes.ok) throw new Error(`Current weather data not found for ${city}`);
            if (!forecastRes.ok) throw new Error(`Forecast data not found for ${city}`);

            const currentWeatherData = await currentWeatherRes.json();
            const forecastData = await forecastRes.json();

            displayCurrentWeather(currentWeatherData);
            displayForecast(forecastData);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            alert(`Could not fetch weather data: ${error.message}. Please try again.`);
            clearWeatherDisplay(); // Clear display on error
        }
    }

    // Function to display current weather
    function displayCurrentWeather(data) {
        currentWeatherDiv.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Temperature: ${data.main.temp}°C</p>
            <p>Feels like: ${data.main.feels_like}°C</p>
            <p>Condition: ${data.weather[0].description}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind Speed: ${data.wind.speed} m/s</p>
            <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
        `;
    }

    // Function to display 5-day forecast
    function displayForecast(data) {
        forecastContainer.innerHTML = ''; // Clear previous forecast
        const dailyForecasts = {};

        // Group forecasts by day
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    temp_min: item.main.temp_min,
                    temp_max: item.main.temp_max,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    humidity: item.main.humidity,
                    wind_speed: item.wind.speed,
                    count: 1
                };
            } else {
                dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, item.main.temp_min);
                dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, item.main.temp_max);
                // For simplicity, we'll take the last description/icon for the day. A more complex approach would involve averaging or picking the most frequent.
                dailyForecasts[date].description = item.weather[0].description;
                dailyForecasts[date].icon = item.weather[0].icon;
                dailyForecasts[date].humidity += item.main.humidity;
                dailyForecasts[date].wind_speed += item.wind.speed;
                dailyForecasts[date].count++;
            }
        });

        let dayCount = 0;
        for (const date in dailyForecasts) {
            if (dayCount >= 5) break; // Display only 5 days
            const avgHumidity = (dailyForecasts[date].humidity / dailyForecasts[date].count).toFixed(0);
            const avgWindSpeed = (dailyForecasts[date].wind_speed / dailyForecasts[date].count).toFixed(1);

            const forecastCard = document.createElement('div');
            forecastCard.classList.add('forecast-card');
            forecastCard.innerHTML = `
                <h3>${date}</h3>
                <img src="http://openweathermap.org/img/wn/${dailyForecasts[date].icon}.png" alt="${dailyForecasts[date].description}">
                <p>Temp: ${dailyForecasts[date].temp_min.toFixed(0)}°C / ${dailyForecasts[date].temp_max.toFixed(0)}°C</p>
                <p>Desc: ${dailyForecasts[date].description}</p>
                <p>Humidity: ${avgHumidity}%</p>
                <p>Wind: ${avgWindSpeed} m/s</p>
            `;
            forecastContainer.appendChild(forecastCard);
            dayCount++;
        }
    }

    // Function to clear weather display on error or new search
    function clearWeatherDisplay() {
        currentWeatherDiv.innerHTML = `
            <h2>Enter a city to see the weather!</h2>
            <p>Or use your current location.</p>
        `;
        forecastContainer.innerHTML = '';
    }

    // Function to load major cities weather
    async function loadMajorCitiesWeather() {
        majorCitiesList.innerHTML = ''; // Clear previous
        for (const city of defaultMajorCities) {
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`Could not fetch weather for ${city}: ${response.statusText}`);
                    continue; // Skip to next city if one fails
                }
                const data = await response.json();
                const majorCityCard = document.createElement('div');
                majorCityCard.classList.add('major-city-card');
                majorCityCard.innerHTML = `
                    <h3>${data.name}</h3>
                    <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
                    <p>Temp: ${data.main.temp}°C</p>
                    <p>Desc: ${data.weather[0].description}</p>
                `;
                majorCitiesList.appendChild(majorCityCard);
            } catch (error) {
                console.error(`Error loading major city weather for ${city}:`, error);
            }
        }
    }

    // Event Listeners
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
            cityInput.value = ''; // Clear input
        } else {
            alert('Please enter a city name.');
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    currentLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const geoApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
                    const response = await fetch(geoApiUrl);
                    if (!response.ok) throw new Error('Could not find current location weather data.');
                    const data = await response.json();
                    getWeatherData(data.name); // Use the city name from geolocation data
                } catch (error) {
                    console.error("Error fetching current location weather:", error);
                    alert(`Could not get current location weather: ${error.message}`);
                }
            }, (error) => {
                alert(`Geolocation error: ${error.message}. Please enable location services.`);
                console.error("Geolocation error:", error);
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });

    // Initial load
    clearWeatherDisplay(); // Show initial message
    loadMajorCitiesWeather(); // Load major cities on page load
});