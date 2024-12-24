const axios = require('axios');
const translate = require('@vitalets/google-translate-api');

/**
 * Retrieves current weather based on user input.
 * @param {Context} ctx - Message Context.
 * @param {string} resultMessage - Message template for successful weather retrieval.
 * @param {string} errorMessage - Error message.
 * @param {object} texts - Text message object.
 */
async function handleWeatherInput(ctx, resultMessage, errorMessage, texts) {
  const userInputCity = ctx.message.text.trim();
  
  if (!userInputCity) {
    ctx.reply('Пожалуйста, введите название города.');
    return;
  }

  try {
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: userInputCity,
          appid: process.env.WEATHER_API_KEY,
          units: 'metric',
          lang: 'ru'
        }
      }
    );

    const weatherData = weatherResponse.data;    
    let finalCityName = weatherData.name;

    const temp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const description = weatherData.weather[0].description;
    
    const weatherInfo = resultMessage
      .replace('{city}', finalCityName)
      .replace('{temp}', temp)
      .replace('{feels_like}', feelsLike)
      .replace('{description}', description);

    ctx.reply(weatherInfo);
  } catch (error) {
    console.error('Error when retrieving weather:', error.message);
    ctx.reply(errorMessage);
  }
}

/**
 * Retrieves 3-day weather forecast based on user input.
 * @param {Context} ctx - Message Context.
 * @param {string} resultMessage - Message template for successful forecast retrieval.
 * @param {string} errorMessage - Error message.
 * @param {object} texts - Text message object.
 */
async function handleWeatherForecast(ctx, resultMessage, errorMessage, texts) {
  const userInputCity = ctx.message.text.trim();

  if (!userInputCity) {
    ctx.reply('🌦 Пожалуйста, введите название города для прогноза на 3 дня.');
    return;
  }

  try {
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          q: userInputCity,
          appid: process.env.WEATHER_API_KEY,
          units: 'metric',
          lang: 'ru',
          cnt: 24 // 3 дня * 8 промежутков (каждые 3 часа)
        }
      }
    );

    const forecastData = forecastResponse.data;
    const city = forecastData.city.name;

    let forecastMessage = `🌦 Прогноз погоды на 3 дня в городе ${city}:\n\n`;

    // Берём данные с интервалом раз в день (каждые 8 шагов)
    for (let i = 0; i < forecastData.list.length; i += 8) {
      const day = forecastData.list[i];
      const date = new Date(day.dt * 1000).toLocaleDateString('ru-RU');
      const temp = Math.round(day.main.temp);
      const feelsLike = Math.round(day.main.feels_like);
      const description = day.weather[0].description;

      forecastMessage += `📅 **${date}**:\n`;
      forecastMessage += `🌡 Температура: ${temp}°C\n`;
      forecastMessage += `🤔 Ощущается как: ${feelsLike}°C\n`;
      forecastMessage += `☁️ ${description}\n\n`;
    }

    ctx.reply(forecastMessage);
  } catch (error) {
    console.error('Error when retrieving 3-day weather forecast:', error.message);
    ctx.reply(errorMessage);
  }
}

module.exports = { handleWeatherInput, handleWeatherForecast };
