import axios from 'axios';
import { Markup } from 'telegraf';
import { BotContext, UserState, WeatherResponse, WeatherForecastResponse } from '../types';
import { config } from '../config/env';

export async function showCityMenu(ctx: BotContext): Promise<void> {
  const cityButtons = [
    ['Сумы', 'Киев'],
    ['Харьков', 'Львов'],
    ['Одесса', 'Днепр'],
    ['Чернигов', 'Запорожье'],
    ['Винница', 'Полтава'],
    ['Черкассы', 'Ивано-Франковск'],
    ['✍️ Ввести вручную', '🏠 В главное меню']
  ];

  await ctx.reply(
    '🏙️ *Выберите город для просмотра погоды:*',
    Markup.keyboard(cityButtons).resize()
  );
}

/**
 * Ask the user to enter the city name manually.
 */
export async function handleManualCityInput(ctx: BotContext): Promise<void> {
  await ctx.reply('📝 Введите название города вручную:');
}

/**
 * Getting the current weather (for today).
 */
export async function handleWeatherInput(
  ctx: BotContext,
  _userState: UserState,
  resultMessage: string,
  _errorMessage: string
): Promise<void> {
  if (!ctx.message || !('text' in ctx.message)) {
    return;
  }

  const userInputCity = ctx.message.text.trim();

  if (!userInputCity) {
    await ctx.reply('🌦 Пожалуйста, введите название города.');
    return;
  }

  try {
    const weatherResponse = await axios.get<WeatherResponse>(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          q: userInputCity,
          appid: config.apis.weather.key,
          units: 'metric',
          lang: 'ru'
        }
      }
    );

    const weatherData = weatherResponse.data;
    const finalCityName = weatherData.name;
    const temp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const description = weatherData.weather[0]?.description || 'N/A';

    const weatherInfo = resultMessage
      .replace('{city}', finalCityName)
      .replace('{temp}', temp.toString())
      .replace('{feels_like}', feelsLike.toString())
      .replace('{description}', description);

    await ctx.reply(weatherInfo);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error when retrieving weather:', errorMessage);
    await ctx.reply('❌ Город не найден. Проверьте правильность названия или попробуйте ввести на русском языке.');
  }
}

/**
 * Receive a 3-day weather forecast.
 */
export async function handleWeatherForecast(
  ctx: BotContext,
  _userState: UserState,
  _resultMessage: string,
  _errorMessage: string
): Promise<void> {
  if (!ctx.message || !('text' in ctx.message)) {
    return;
  }

  const userInputCity = ctx.message.text.trim();

  if (!userInputCity) {
    await ctx.reply('🌦 Пожалуйста, введите название города для прогноза на 3 дня.');
    return;
  }

  try {
    const forecastResponse = await axios.get<WeatherForecastResponse>(
      'https://api.openweathermap.org/data/2.5/forecast',
      {
        params: {
          q: userInputCity,
          appid: config.apis.weather.key,
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
      const description = day.weather[0]?.description || 'N/A';

      forecastMessage += `📅 **${date}**:\n`;
      forecastMessage += `🌡 Температура: ${temp}°C\n`;
      forecastMessage += `🤔 Ощущается как: ${feelsLike}°C\n`;
      forecastMessage += `☁️ ${description}\n\n`;
    }

    await ctx.reply(forecastMessage);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error when receiving weather forecast', errorMessage);
    await ctx.reply('❌ Город не найден. Проверьте правильность названия или попробуйте ввести на Кириллице.');
  }
}

