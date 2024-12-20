const axios = require('axios');
const translate = require('@vitalets/google-translate-api');

/**
 * Processes user input to retrieve the weather.
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
    // Request to OpenWeatherMap API with entered city
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

    // Rounding temperatures to whole numbers
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

module.exports = { handleWeatherInput };
