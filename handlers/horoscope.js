const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');
require('dotenv').config();

/**
 * Get horoscope by zodiac sign and day with translation into Russian.
 * @param {Context} ctx - Telegraf Context.
 * @param {string} sign - Zodiac sign.
 * @param {string} day - Day (today, tomorrow, etc.).
 * @param {string} errorMessage - Error message.
 */
async function handleHoroscope(ctx, sign, day = 'today', errorMessage) {
  try {
    const options = {
      method: 'GET',
      url: process.env.HOROSCOPE_API_URL, 
      params: {
        sign,
        day    // 'today' / 'tomorrow'
      },
      headers: {
        'x-rapidapi-key': process.env.HOROSCOPE_API_KEY,
        'x-rapidapi-host': process.env.HOROSCOPE_API_HOST
      }
    };

    const response = await axios.request(options);
    //console.log('🔥 Ответ от нового API:', response.data);

    // IMPORTANT! Look at the structure:
    // {
    //   data: {
    //     date: 'Dec 24, 2024',
    //     horoscope_data: 'Try not to be too competitive today, Cancer...'
    //   },
    //   status: 200,
    //   success: true
    // }

    const apiData = response.data;
    const horoscopeData = apiData?.data?.horoscope_data;
    if (!horoscopeData) {
      console.warn(`⚠️ API не вернул данных для знака: ${sign}`);
      return ctx.reply('❌ Гороскоп временно недоступен. Пожалуйста, попробуйте позже.');
    }

    let originalText = `✨ **Гороскоп для ${sign.toUpperCase()} на ${day}:**\n`;
    originalText += `🔮 Предсказание: ${horoscopeData}\n`;

    const { text: translatedText } = await translate(originalText, { to: 'ru' });
    ctx.reply(translatedText);

  } catch (error) {
    console.error('❌ Ошибка при получении гороскопа:', error.response?.data || error.message);

    if (
      error.response 
      && error.response.data 
      && typeof error.response.data.message === 'string'
      && error.response.data.message.includes('You have exceeded the MONTHLY quota')
    ) {
      ctx.reply(
        'Извините, мы используем бесплатную версию гороскопа, и лимит запросов исчерпан. Попробуйте завтра или в начале следующего месяца.'
      );
    } else {
      ctx.reply(
        errorMessage || '❌ Произошла ошибка при получении гороскопа. Попробуйте позже.'
      );
    }
  }
}

module.exports = { handleHoroscope };
