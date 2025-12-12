import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import WeatherCard from './components/WeatherCard';
import SearchBar from './components/SearchBar';
import './components/SearchBar.css';

function App() {
  const [cityIds, setCityIds] = useState([]);
  const [weather, setWeather] = useState({});
  const [newCity, setNewCity] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/cities`)
      .then(r => setCityIds(r.data.cityIds || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    cityIds.forEach(id => {
      axios.get(`${process.env.REACT_APP_API_URL}/weather/${id}`)
        .then(r => setWeather(prev => ({ ...prev, [id]: r.data.data })))
        .catch(console.error);
    });
  }, [cityIds]);

  const handleAddCity = async (e) => {
    e && e.preventDefault();
    if (!newCity || !newCity.trim()) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/cities`, { name: newCity.trim() });
      const cityId = res.data.cityId;
      if (cityId) {
        setCityIds(prev => prev.includes(cityId) ? prev : [...prev, cityId]);
        setNewCity('');
      }
    } catch (err) {
      console.error('Add city failed', err);
      alert('Failed to add city');
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/cities/${id}`);
    } catch (err) {
      console.warn('Server delete failed', err);
    }
    setCityIds(prev => prev.filter(x => String(x) !== String(id)));
    setWeather(prev => { const c = { ...prev }; delete c[id]; return c; });
  };

  return (
    <div style={{ padding: 20, background: '#0f1724', minHeight: '100vh', color: '#fff' }}>
      <h1>Weather App</h1>
      <SearchBar
        value={newCity}
        onChange={(v) => setNewCity(v)}
        onSubmit={handleAddCity}
        placeholder="Search city name (e.g., London)"
      />

      <div className="card-grid">
        {Object.keys(weather).length === 0 && <p>Loading...</p>}
        {Object.entries(weather).map(([id, w], idx) => (
          <WeatherCard key={id} info={w} index={idx} onRemove={() => handleRemove(id)} />
        ))}
      </div>
    </div>
  );
}

export default App;


