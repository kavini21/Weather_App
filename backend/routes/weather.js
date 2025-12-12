const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = {}; // in-memory cache

// read cities.json
const cityFile = path.join(__dirname, '..', 'data', 'cities.json');
let cityList = [];
try {
  const txt = fs.readFileSync(cityFile, 'utf8');
  const parsed = JSON.parse(txt);
  // support either { List: [...] } or an array
  cityList = parsed && parsed.List ? parsed.List : (Array.isArray(parsed) ? parsed : []);
} catch (err) {
  console.error('Could not read cities.json', err);
}

// GET /api/cities
router.get('/cities', (req, res) => {
  const ids = cityList.map(c => c.CityCode).filter(Boolean);
  res.json({ cityIds: ids });
});

// POST /api/cities - add a city by name (resolve via OpenWeather and persist)
router.post('/cities', async (req, res) => {
  const name = req.body.name;
  if (!name) return res.status(400).json({ error: 'Missing city name' });

  const key = process.env.OPENWEATHER_KEY;
  if (!key) return res.status(500).json({ error: 'Missing OPENWEATHER_KEY on server' });

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(name)}&appid=${key}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data || !data.id) return res.status(404).json({ error: 'City not found' });

    const cityId = String(data.id);
    // prevent duplicates
    if (cityList.find(c => String(c.CityCode) === cityId)) return res.json({ cityId, already: true });

    const newItem = { CityCode: cityId, CityName: data.name, Temp: String(data.main?.temp || ''), Status: data.weather?.[0]?.main || '' };
    cityList.push(newItem);
    try { fs.writeFileSync(cityFile, JSON.stringify({ List: cityList }, null, 2), 'utf8'); } catch (err) { console.error('Failed to persist cities.json', err); }

    return res.json({ cityId, already: false });
  } catch (err) {
    console.error('Error adding city', err);
    return res.status(500).json({ error: 'Failed to add city' });
  }
});

// DELETE /api/cities/:id - remove a city and persist
router.delete('/cities/:id', (req, res) => {
  const id = String(req.params.id);
  const idx = cityList.findIndex(c => String(c.CityCode) === id);
  if (idx === -1) return res.status(404).json({ error: 'City not found' });
  cityList.splice(idx, 1);
  try { fs.writeFileSync(cityFile, JSON.stringify({ List: cityList }, null, 2), 'utf8'); } catch (err) { console.error('Failed to persist cities.json after delete', err); }
  return res.json({ deleted: true, cityId: id });
});

// GET /api/weather/:cityId
router.get('/weather/:cityId', async (req, res) => {
  const cityId = req.params.cityId;
  const now = Date.now();

  // serve from cache if fresh
  if (cache[cityId] && now - cache[cityId].ts < CACHE_TTL) {
    return res.json({ fromCache: true, data: cache[cityId].data });
  }

  const key = process.env.OPENWEATHER_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${key}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    // store in cache
    cache[cityId] = { ts: now, data };
    res.json({ fromCache: false, data });
  } catch (err) {
    console.error('Fetch error', err);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

module.exports = router;
