import axios, { AxiosError } from 'axios';
import { translate } from '@vitalets/google-translate-api';
import { BotContext, ZodiacSign, HoroscopeResponse } from '../types';
import { config } from '../config/env';

/**
 * Get horoscope by zodiac sign and day with translation into Russian.
 */
export async function handleHoroscope(
  ctx: BotContext,
  sign: ZodiacSign,
  day: string = 'today',
  errorMessage: string
): Promise<void> {
  try {
    const options = {
      method: 'GET' as const,
      url: config.apis.horoscope.url,
      params: {
        sign,
        day
      },
      headers: {
        'x-rapidapi-key': config.apis.horoscope.key,
        'x-rapidapi-host': config.apis.horoscope.host
      }
    };

    const response = await axios.request<HoroscopeResponse>(options);

    const apiData = response.data;
    const horoscopeData = apiData?.data?.horoscope_data;
    
    if (!horoscopeData) {
      console.warn(`⚠️ API не вернул данных для знака: ${sign}`);
      await ctx.reply('❌ Гороскоп временно недоступен. Пожалуйста, попробуйте позже.');
      return;
    }

    let originalText = `✨ **Гороскоп для ${sign.toUpperCase()} на ${day}:**\n`;
    originalText += `🔮 Предсказание: ${horoscopeData}\n`;

    const { text: translatedText } = await translate(originalText, { to: 'ru' });
    await ctx.reply(translatedText);

  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error('❌ Ошибка при получении гороскопа:', axiosError.response?.data || axiosError.message);

    if (
      axiosError.response?.data?.message &&
      typeof axiosError.response.data.message === 'string' &&
      axiosError.response.data.message.includes('You have exceeded the MONTHLY quota')
    ) {
      await ctx.reply(
        'Извините, мы используем бесплатную версию гороскопа, и лимит запросов исчерпан. Попробуйте завтра или в начале следующего месяца.'
      );
    } else {
      await ctx.reply(
        errorMessage || '❌ Произошла ошибка при получении гороскопа. Попробуйте позже.'
      );
    }
  }
}

