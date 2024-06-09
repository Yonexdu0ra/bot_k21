async function getWeather(location) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=c666356ba51a2a95cb41a10e7743bd97&units=metric`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

export default getWeather;