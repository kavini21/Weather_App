import React from "react";
import "./WeatherCard.css";
import sunIcon from "../assets/icons/sun.svg";
import cloudsIcon from "../assets/icons/clouds.svg";
import rainIcon from "../assets/icons/rain.svg";
import thunderIcon from "../assets/icons/thunder.svg";
import snowIcon from "../assets/icons/snow.svg";
import mistIcon from "../assets/icons/mist.svg";
import pressureIcon from "../assets/icons/pressure.svg";
import humidityIcon from "../assets/icons/humidity.svg";
import visibilityIcon from "../assets/icons/visibility.svg";
import windIconSmall from "../assets/icons/wind.svg";
import sunriseIcon from "../assets/icons/sunrise.svg";
import sunsetIcon from "../assets/icons/sunset.svg";

export default function WeatherCard({ info, index = 0, onRemove }) {
  const {
    name,
    sys = {},
    main = {},
    weather = [{ description: '', main: '' }],
    wind = {},
    visibility = 0,
    dt
  } = info || {};

  // Format current time and date
  const formatDateTime = (timestamp) => {
    if (!timestamp) return { time: '9:19am', date: 'Feb 8' };
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const time = `${formattedHours}:${formattedMinutes}${ampm}`;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}`;
    return { time, date: dateStr };
  };

  // Format sunrise/sunset times
  const formatTime = (timestamp) => {
    if (!timestamp) return '6:05am';
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  // Get weather icon
  const getWeatherIcon = (weatherMain) => {
    const map = {
      Clear: sunIcon,
      Clouds: cloudsIcon,
      Rain: rainIcon,
      Drizzle: rainIcon,
      Thunderstorm: thunderIcon,
      Snow: snowIcon,
      Mist: mistIcon,
      Fog: mistIcon,
      Haze: mistIcon
    };
    return map[weatherMain] || cloudsIcon;
  };

  const { time, date } = formatDateTime(dt);

  // simple palette selection by index
  const palettes = [
    ['#5db3ff', '#3a8dff'], // blue
    ['#b78bff', '#6c49ff'], // purple
    ['#6ad08a', '#37b26b'], // green
    ['#ffb36a', '#ff8a3d'], // orange
    ['#ff7b7b', '#e94b4b'], // red
    ['#5ec1c7', '#2aa3a8']  // teal
  ];
  const p = palettes[index % palettes.length];

  return (
    <div className="weather-card">

      <div className="card-top" style={{ background: `linear-gradient(135deg, ${p[0]}, ${p[1]})` }}>
        <button className="close-btn" title="Remove" onClick={() => onRemove && onRemove()}>×</button>
        <div className="weather-header">
          <div className="city-block">
            <h2 className="city-name">{name}{sys.country ? `, ${sys.country}` : ''}</h2>
            <p className="time">{time}, {date}</p>
          </div>

          <div className="temp-block">
            <div className="temp-val">{main.temp ? Math.round(main.temp) : '-'}°C</div>
            <div className="minmax-inline">
              <div>Min: {main.temp_min ? Math.round(main.temp_min) : '-'}°C</div>
              <div>Max: {main.temp_max ? Math.round(main.temp_max) : '-'}°C</div>
            </div>
          </div>
        </div>

        <div className="weather-middle">
          <div className="desc-icon">
            <div className="icon-large">
              <img src={getWeatherIcon(weather[0].main)} alt={weather[0].main} className="icon-svg" />
            </div>
            <div className="desc-group">
              <p className="desc-title">{weather[0].main}</p>
              <p className="desc-sub">{weather[0].description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-bottom">
        <div className="info-col">
          <div className="info-item"><img src={pressureIcon} className="info-svg" alt="Pressure"/><span><strong>Pressure:</strong> {main.pressure || '-'} hPa</span></div>
          <div className="info-item"><img src={humidityIcon} className="info-svg" alt="Humidity"/><span><strong>Humidity:</strong> {main.humidity || '-'}%</span></div>
          <div className="info-item"><img src={visibilityIcon} className="info-svg" alt="Visibility"/><span><strong>Visibility:</strong> {visibility ? (visibility/1000).toFixed(1) : '-'} km</span></div>
        </div>

        <div className="info-col center">
          <div className="info-item"><img src={windIconSmall} className="info-svg" alt="Wind"/><span>{wind.speed ? wind.speed.toFixed(1) : '-'} m/s</span></div>
          <div className="info-item"><span className="info-icon">↗</span><span>{wind.deg || '-'}°</span></div>
        </div>

        <div className="info-col right">
          <div className="info-item"><img src={sunriseIcon} className="info-svg" alt="Sunrise"/><span><strong>Sunrise:</strong> {formatTime(sys.sunrise)}</span></div>
          <div className="info-item"><img src={sunsetIcon} className="info-svg" alt="Sunset"/><span><strong>Sunset:</strong> {formatTime(sys.sunset)}</span></div>
        </div>
      </div>

    </div>
  );
}
