import React, { useState, useEffect } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Wind,
  Thermometer
} from "lucide-react";

function WeatherApp() {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState("New York");
  const [customLocation, setCustomLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState("https://picsum.photos/1920/1080");

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      margin: 0,
      padding: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial, sans-serif",
      color: "#fff",
      boxSizing: "border-box",
      overflow: "hidden",
    },
    card: {
      background: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(10px)",
      borderRadius: "1.5rem",
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
      padding: "2rem",
      maxWidth: "90%",
      width: "400px",
      textAlign: "center",
    },
    button: {
      padding: "0.7rem 1.5rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      backgroundColor: "#3b82f6",
      color: "white",
      transition: "transform 0.2s, box-shadow 0.2s",
      marginTop: "1rem",
    },
    weatherInfo: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "1rem",
    },
    weatherIcon: {
      fontSize: "3rem",
      marginBottom: "0.5rem",
    },
    errorText: {
      color: "#f87171",
      fontSize: "1.2rem",
      fontWeight: "bold",
    },
    input: {
      padding: "0.5rem",
      borderRadius: "0.5rem",
      border: "1px solid #ccc",
      width: "calc(100% - 1rem)",
      marginBottom: "1rem",
      outline: "none",
    },
  };

  const globalStyles = {
    body: {
      margin: 0,
      padding: 0,
      overflow: "hidden",
      fontFamily: "Arial, sans-serif",
    },
  };

  useEffect(() => {
    Object.keys(globalStyles.body).forEach((key) => {
      document.body.style[key] = globalStyles.body[key];
    });
  }, []);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const geocodingResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      if (!geocodingResponse.ok) {
        throw new Error("Location not found");
      }
      const geocodingData = await geocodingResponse.json();
      if (!geocodingData.results || geocodingData.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude } = geocodingData.results[0];

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m`
      );

      if (!response.ok) {
        throw new Error("Weather data fetch failed");
      }

      const data = await response.json();
      setWeatherData({
        temperature: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        weathercode: data.current_weather.weathercode,
        locationName: geocodingData.results[0].name,
      });

      // Fetch background image based on city name
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/photos/random?query=${city},landscape&client_id=YOUR_UNSPLASH_ACCESS_KEY`
      );
      if (unsplashResponse.ok) {
        const unsplashData = await unsplashResponse.json();
        setBackgroundImage(unsplashData.urls.full);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (customLocation) {
      fetchWeather(customLocation);
      setCustomLocation("");
    }
  };

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.errorText}>Error: {error}</h1>
          <button
            onClick={() => fetchWeather(location)}
            style={{ ...styles.button, backgroundColor: "#f43f5e" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <form onSubmit={handleLocationSearch}>
          <input
            type="text"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="Search city..."
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Search
          </button>
        </form>

        {loading ? (
          <p>Loading weather data...</p>
        ) : weatherData ? (
          <div style={styles.weatherInfo}>
            <div style={styles.weatherIcon}>
              <Thermometer />
            </div>
            <h2>{weatherData.locationName || location}</h2>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {weatherData.temperature}°C
            </p>
            <p>Windspeed: {weatherData.windspeed} km/h</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default WeatherApp;
