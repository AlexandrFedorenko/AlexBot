const axios = require('axios');
const { Markup } = require('telegraf');

async function showCityMenu(ctx) {
  const cityButtons = [
    ['Сумы', 'Киев'],
    ['Харьков', 'Львов'],
    ['Одесса', 'Днепр'],
    ['Чернигов', 'Запорожье'],
    ['Винница', 'Полтава'],
    ['Черкассы', 'Ивано-Франковск'],
    ['✍️ Ввести вручную', '🏠 В главное меню']
  ];

  ctx.reply(
    '🏙️ *Выберите город для просмотра погоды:*',
    Markup.keyboard(cityButtons).resize()
  );
}

/**
 * Ask the user to enter the city name manually.
 */
async function handleManualCityInput(ctx) {
  ctx.reply('📝 Введите название города вручную:');
}

/**
 * Getting the current weather (for today).
 * @param {Context} ctx - Telegraf context
 * @param {Object} userState - status object for a specific userId
 * @param {string} resultMessage - Weather message template (from texts.json)
 * @param {string} errorMessage -  Error message
 */
async function handleWeatherInput(ctx, userState, resultMessage, errorMessage) {
  const userInputCity = ctx.message.text.trim();

  if (!userInputCity) {
    ctx.reply('🌦 Пожалуйста, введите название города.');
    return;
  }

  try {
    const weatherResponse = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
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
    const finalCityName = weatherData.name;
    const temp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const description = weatherData.weather[0].description;

    const weatherInfo = resultMessage
      .replace('{city}', finalCityName)
      .replace('{temp}', temp)
      .replace('{feels_like}', feelsLike)
      .replace('{description}', description);

    ctx.reply(weatherInfo);
    // do NOT reset userState.weatherState,
    // so that the user can watch several cities in a row in this mode.
  } catch (error) {
    console.error('❌ Error when retrieving weather:', error.message);
    ctx.reply('❌ Город не найден. Проверьте правильность названия или попробуйте ввести на русском языке.');
  }
}

/**
 * Receive a 3-day weather forecast.
 * @param {Context} ctx
 * @param {Object} userState - status object for a specific userId
 * @param {string} resultMessage - Forecast message template (from texts.json)
 * @param {string} errorMessage - Error message
 */
async function handleWeatherForecast(ctx, userState, resultMessage, errorMessage) {
  const userInputCity = ctx.message.text.trim();

  if (!userInputCity) {
    ctx.reply('🌦 Пожалуйста, введите название города для прогноза на 3 дня.');
    return;
  }

  try {
    const forecastResponse = await axios.get(
      'https://api.openweathermap.org/data/2.5/forecast',
      {
        params: {
          q: userInputCity,
          appid: process.env.WEATHER_API_KEY,
          units: 'metric',
          lang: 'ru',
          cnt: 24
        }
      }
    );

    const forecastData = forecastResponse.data;
    const city = forecastData.city.name;

    let forecastMessage = `🌦 Прогноз погоды на 3 дня в городе ${city}:\n\n`;

    // We take data every 8 blocks (24 hours / 3 hours = 8)
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
    // do NOT reset userState.weatherState, so that the user can view
    // several cities in a row in “3-day forecast” mode.
  } catch (error) {
    console.error('❌ Error when receiving weather forecast', error.message);
    ctx.reply('❌ Город не найден. Проверьте правильность названия или попробуйте ввести на Кириллице.');
  }
}

module.exports = {
  showCityMenu,
  handleManualCityInput,
  handleWeatherInput,
  handleWeatherForecast
};
