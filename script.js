document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const leftPanel = document.getElementById('left-panel');
    const cityInput = document.getElementById('city-input');
    const themeToggle = document.getElementById('theme-toggle');
    const celsiusBtn = document.getElementById('celsius-btn');
    const fahrenheitBtn = document.getElementById('fahrenheit-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const currentWeatherDiv = document.getElementById('current-weather');
    const rightPanelContent = document.getElementById('right-panel-content');
    const searchHistoryDiv = document.getElementById('search-history');

    // --- STATE & API ---
    const apiKey = '3f5cf2900d46ab910ae2b474d051af34'; // Your OpenWeatherMap API key
    let currentUnits = 'metric';
    let currentCity = '';
    const initialMajorCities = ["New Delhi", "New York", "London", "Tokyo", "Sydney"];
    
    // --- HELPER FUNCTIONS ---
    const formatGmtOffset = (offsetSeconds) => {
        const offsetHours = offsetSeconds / 3600;
        const sign = offsetHours >= 0 ? '+' : '-';
        const hours = Math.floor(Math.abs(offsetHours));
        const minutes = (Math.abs(offsetHours) * 60) % 60;
        return `GMT ${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
    };
    const getLocalTime = (timezoneOffset) => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localTime = new Date(utc + (timezoneOffset * 1000));
        const timeString = localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${timeString} (${formatGmtOffset(timezoneOffset)})`;
    };

    // --- RENDER DASHBOARD (BUG FIX) ---
    // This new robust function creates the dashboard structure programmatically
    const renderDashboardStructure = () => {
        rightPanelContent.innerHTML = ''; // Clear previous content
        const container = document.createElement('div');
        container.id = 'weather-details-content';

        const sections = [
            { id: 'weather-highlights', title: "Today's Highlights", gridClass: 'highlights-grid' },
            { id: 'hourly-forecast', title: "Today's Forecast", gridClass: 'hourly-forecast-container' },
            { id: 'forecast-container', title: '5-Day Forecast', gridClass: 'forecast-grid' },
            { id: 'major-cities-list', title: 'Other Major Cities', gridClass: 'major-cities-grid' }
        ];

        sections.forEach(sec => {
            const sectionEl = document.createElement('section');
            sectionEl.className = `${sec.id.replace(/-/g, '_')}-section`;
            sectionEl.innerHTML = `<h2 class="section-header">${sec.title}</h2>`;
            const gridEl = document.createElement('div');
            gridEl.id = sec.id;
            gridEl.className = sec.gridClass;
            sectionEl.appendChild(gridEl);
            container.appendChild(sectionEl);
        });

        rightPanelContent.appendChild(container);

        // Return references to the newly created grid containers
        return {
            highlightsDiv: document.getElementById('weather-highlights'),
            hourlyForecastDiv: document.getElementById('hourly-forecast'),
            forecastContainer: document.getElementById('forecast-container'),
            majorCitiesList: document.getElementById('major-cities-list'),
        };
    };

    // --- API & DISPLAY LOGIC ---
    async function fetchAndDisplayWeather(city) {
        currentWeatherDiv.innerHTML = `<div class="loader">Loading...</div>`;
        const dashboardElements = renderDashboardStructure(); // Create dashboard and get element refs

        try {
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnits}`;
            const weatherRes = await fetch(weatherUrl);
            if (!weatherRes.ok) throw new Error('City not found.');
            const weatherData = await weatherRes.json();
            currentCity = weatherData.name;

            const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}&units=${currentUnits}&exclude=minutely,alerts`;
            const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`;
            
            const [oneCallData, airPollutionData] = await Promise.all([fetch(oneCallUrl).then(res => res.json()), fetch(airPollutionUrl).then(res => res.json())]);

            displayCurrentWeather(weatherData);
            displayHighlights(weatherData, oneCallData, airPollutionData, dashboardElements.highlightsDiv);
            displayHourlyForecast(oneCallData.hourly, dashboardElements.hourlyForecastDiv);
            display5DayForecast(oneCallData.daily, dashboardElements.forecastContainer);
            loadSecondaryMajorCities(dashboardElements.majorCitiesList);
            setDynamicBackground(weatherData.weather[0].main);
            addToSearchHistory(weatherData.name);

        } catch (error) {
            currentWeatherDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
            rightPanelContent.innerHTML = '';
            setDynamicBackground('');
        }
    }

    // --- DISPLAY FUNCTIONS (Unchanged logic, just receive elements) ---
    function displayCurrentWeather(data) { /* No change from previous version */ }
    function displayHighlights(weatherData, oneCallData, airPollutionData, element) { /* No change */ }
    function displayHourlyForecast(hourlyData, element) { /* No change */ }
    function display5DayForecast(dailyData, element) { /* No change */ }
    async function loadSecondaryMajorCities(element) { /* No change */ }
    
    // --- INITIAL VIEW ---
    async function displayInitialView() {
        currentCity = '';
        currentWeatherDiv.innerHTML = `<div class="call-to-action"><h3>Search for a city or use your current location.</h3></div>`;
        setDynamicBackground('');
        rightPanelContent.innerHTML = `<div class="initial-view-container"><h2 class="section-header">Major Cities</h2><div class="initial-cities-grid"></div></div>`;
        const grid = document.querySelector('.initial-cities-grid');
        grid.innerHTML = '<div class="loader">Loading cities...</div>';

        const cityPromises = initialMajorCities.map(city => 
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnits}`).then(res => res.json())
        );

        const results = await Promise.all(cityPromises);
        grid.innerHTML = results.map(data => `
            <div class="initial-city-card" data-city="${data.name}">
                <div class="city-header">
                    <div class="info">
                        <h3>${data.name}</h3>
                        <p>${getLocalTime(data.timezone)}</p>
                    </div>
                    <p class="temp">${data.main.temp.toFixed(0)}°</p>
                </div>
                <div class="city-footer">
                    <span>${data.weather[0].description}</span>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="">
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.initial-city-card').forEach(card => card.addEventListener('click', () => fetchAndDisplayWeather(card.dataset.city)));
    }

    // --- EVENT LISTENERS & INITIALIZATION ---
    function setDynamicBackground(weatherMain) { /* ... unchanged ... */ }
    const getSearchHistory = () => JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    function addToSearchHistory(city) { /* ... unchanged ... */ }
    function displaySearchHistory() { /* ... unchanged ... */ }
    
    currentLocationBtn.addEventListener('click', () => { /* ... unchanged ... */ });

    function applyUnits(unit) {
        currentUnits = unit;
        celsiusBtn.classList.toggle('active', unit === 'metric');
        fahrenheitBtn.classList.toggle('active', unit === 'imperial');
        localStorage.setItem('weatherAppUnits', unit);
        if (currentCity) {
            fetchAndDisplayWeather(currentCity);
        } else {
            displayInitialView();
        }
    }
    
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        localStorage.setItem('weatherAppTheme', theme);
    }

    function initialize() {
        const savedTheme = localStorage.getItem('weatherAppTheme') || 'light';
        const savedUnits = localStorage.getItem('weatherAppUnits') || 'metric';
        themeToggle.checked = savedTheme === 'dark';
        applyTheme(savedTheme);
        applyUnits(savedUnits);
        displaySearchHistory();
    }
    
    themeToggle.addEventListener('change', () => applyTheme(themeToggle.checked ? 'dark' : 'light'));
    celsiusBtn.addEventListener('click', () => applyUnits('metric'));
    fahrenheitBtn.addEventListener('click', () => applyUnits('imperial'));
    cityInput.addEventListener('keypress', e => { if (e.key === 'Enter' && cityInput.value) fetchAndDisplayWeather(cityInput.value.trim()); });
    
    // Pasting unchanged functions for completeness
    function displayCurrentWeather(data) { currentWeatherDiv.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt=""><h1>${data.main.temp.toFixed(0)}°</h1><h2>${data.name}, ${data.sys.country}</h2><p>${new Date().toLocaleDateString('en-US', { weekday: 'long' })} • ${getLocalTime(data.timezone)}</p>`; }
    function displayHighlights(weatherData, oneCallData, airPollutionData, element) { const uvi = oneCallData.current?.uvi ?? 'N/A'; const aqiText = (airPollutionData.list?.[0]) ? ["Good", "Fair", "Moderate", "Poor", "Very Poor"][airPollutionData.list[0].main.aqi - 1] : 'N/A'; const windUnit = currentUnits === 'metric' ? 'm/s' : 'mph'; element.innerHTML = `<div class="card highlight-card"><p class="title"><i class="fas fa-sun"></i> UV Index</p><p class="value">${uvi}</p></div><div class="card highlight-card"><p class="title"><i class="fas fa-wind"></i> Wind</p><p class="value">${weatherData.wind.speed.toFixed(1)} <span>${windUnit}</span></p></div><div class="card highlight-card"><p class="title"><i class="fas fa-tint"></i> Humidity</p><p class="value">${weatherData.main.humidity}<span>%</span></p></div><div class="card highlight-card"><p class="title"><i class="fas fa-eye"></i> Visibility</p><p class="value">${(weatherData.visibility / 1000).toFixed(1)} <span>km</span></p></div><div class="card highlight-card"><p class="title"><i class="fas fa-tachometer-alt"></i> Pressure</p><p class="value">${weatherData.main.pressure} <span>hPa</span></p></div><div class="card highlight-card"><p class="title"><i class="fas fa-smog"></i> Air Quality</p><p class="value">${aqiText}</p></div>`; }
    function displayHourlyForecast(hourlyData, element) { element.innerHTML = ''; (hourlyData || []).slice(1, 9).forEach(item => { const card = document.createElement('div'); card.className = 'card hourly-card'; card.innerHTML = `<p>${new Date(item.dt*1000).toLocaleTimeString('en-US', {hour:'numeric', hour12:true})}</p><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt=""><p><strong>${item.temp.toFixed(0)}°</strong></p>`; element.appendChild(card); }); }
    function display5DayForecast(dailyData, element) { element.innerHTML = ''; (dailyData || []).slice(1, 6).forEach(day => { const card = document.createElement('div'); card.className = 'card forecast-card'; card.innerHTML = `<p class="day">${new Date(day.dt*1000).toLocaleDateString('en-US', { weekday: 'long' })}</p><div class="icon"><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt=""></div><p class="temp">${day.temp.max.toFixed(0)}° / ${day.temp.min.toFixed(0)}°</p>`; element.appendChild(card); }); }
    async function loadSecondaryMajorCities(element) { element.innerHTML = ''; for (const city of initialMajorCities) { if (city.toLowerCase() === currentCity.toLowerCase()) continue; try { const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnits}`); const data = await res.json(); const card = document.createElement('div'); card.className = 'card major-city-card'; card.innerHTML = `<div class="city-info"><h3>${data.name}</h3><p>${getLocalTime(data.timezone)}</p></div><div class="city-temp">${data.main.temp.toFixed(0)}°</div>`; card.addEventListener('click', () => fetchAndDisplayWeather(city)); element.appendChild(card); } catch (error) { console.error(`Error loading secondary city: ${city}`); } } }
    function setDynamicBackground(weatherMain) { leftPanel.className = 'left-panel'; const condition = (weatherMain || '').toLowerCase(); if (['rain', 'drizzle', 'thunderstorm'].includes(condition)) leftPanel.classList.add('bg-rain'); else if (['snow'].includes(condition)) leftPanel.classList.add('bg-snow'); else if (['clear'].includes(condition)) leftPanel.classList.add('bg-clear'); else if (['clouds'].includes(condition)) leftPanel.classList.add('bg-clouds'); else if (['mist', 'haze', 'fog', 'smoke'].includes(condition)) leftPanel.classList.add('bg-mist'); }
    function addToSearchHistory(city) { let history = getSearchHistory(); history = history.filter(c => c.toLowerCase() !== city.toLowerCase()); history.unshift(city); if (history.length > 5) history.pop(); localStorage.setItem('weatherSearchHistory', JSON.stringify(history)); displaySearchHistory(); }
    function displaySearchHistory() { searchHistoryDiv.innerHTML = ''; getSearchHistory().forEach(city => { const btn = document.createElement('button'); btn.className = 'history-btn'; btn.textContent = city; btn.addEventListener('click', () => fetchAndDisplayWeather(city)); searchHistoryDiv.appendChild(btn); }); }
    currentLocationBtn.addEventListener('click', () => { currentWeatherDiv.innerHTML = `<div class="loader">Getting your location...</div>`; navigator.geolocation.getCurrentPosition(async position => { const { latitude, longitude } = position.coords; const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`; const res = await fetch(reverseGeoUrl); const data = await res.json(); if (data.length > 0) { fetchAndDisplayWeather(data[0].name); } else { currentWeatherDiv.innerHTML = `<div class="error-message">Could not determine city.</div>`; } }, error => { currentWeatherDiv.innerHTML = `<div class="error-message">${error.message}</div>`; }); });

    initialize();
});