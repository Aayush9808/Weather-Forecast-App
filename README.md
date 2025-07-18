# Weather Forecast App

This is a simple web application designed to provide current weather conditions and a 5-day forecast for any city in the world. It utilizes the OpenWeatherMap API to fetch real-time weather data.

## 🚀 Features

* **City Search:** Get current weather and forecast by typing a city name.
* **Current Location:** Option to fetch weather data based on your browser's geolocation.
* **5-Day Forecast:** Displays temperature range, conditions, humidity, and wind speed for the next five days.
* **Major Cities List:** Shows quick weather snapshots for a pre-defined list of global cities.
* **Responsive Design:** Adapts to different screen sizes (desktops, tablets, mobiles).

## 🛠️ Technologies Used

* **HTML5:** For the basic structure of the web page.
* **CSS3:** For styling and layout.
* **JavaScript:** For dynamic content, API calls, and interactivity.
* **OpenWeatherMap API:** A free and widely used API for weather data.

## ⚙️ How to Run Locally

Follow these steps to get a copy of the project up and running on your local machine.

### Prerequisites

* A web browser (Chrome, Firefox, Edge, etc.)
* A text editor or IDE (like VS Code)
* **An OpenWeatherMap API Key:**
    1.  Go to [OpenWeatherMap](https://openweathermap.openweathermap.org/api)
    2.  Sign up for a free account.
    3.  Find your API key in your account's API Keys section.

### Installation

1.  **Clone the repository:**
    Open your terminal (Git Bash in VS Code) and run:
    ```bash
    git clone [https://github.com/Aayush9808/weather-forecast-app.git](https://github.com/Aayush9808/weather-forecast-app.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd weather-forecast-app
    ```

3.  **Update your API Key:**
    * Open the `weather-forecast-app` folder in VS Code.
    * Open the `script.js` file.
    * Find the line `const apiKey = 'YOUR_API_KEY';`
    * Replace `'YOUR_API_KEY'` with the actual API key you obtained from OpenWeatherMap.
        ```javascript
        const apiKey = 'YOUR_ACTUAL_OPENWEATHERMAP_API_KEY_HERE'; // Example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
        ```

4.  **Open the Application:**
    Simply open the `index.html` file in your web browser. You can usually do this by right-clicking `index.html` in your file explorer and choosing "Open with" > Your preferred browser.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, feel free to fork the repository and create a pull request, or open an issue.

## 📄 License

This project is open-source. (You can add a specific license if you want, e.g., MIT License)

---
_Built with ❤️ for learning web development._
