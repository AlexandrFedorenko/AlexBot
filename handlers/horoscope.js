const axios = require('axios');

/**
 * Получение гороскопа по знаку зодиака и дню.
 * @param {Context} ctx - Контекст Telegraf.
 * @param {string} sign - Знак зодиака.
 * @param {string} day - День (today, tomorrow, yesterday).
 * @param {string} errorMessage - Сообщение об ошибке.
 */
async function handleHoroscope(ctx, sign, day = 'today', errorMessage) {
  try {
    console.log(`🛠️ Запрос к API для знака: ${sign}, день: ${day}`);

    const options = {
      method: 'GET',
      url: 'https://alexbotteg.onrender.com/api/data',
      params: { sign, day },
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${process.env.CLIENT_SECRET}`
      }
    };

    const response = await axios.request(options);

    if (!response.data || !response.data.horoscope) {
      console.warn(`⚠️ API не вернул данных для знака: ${sign}`);
      ctx.reply('❌ Гороскоп временно недоступен. Пожалуйста, попробуйте позже.');
      return;
    }

    const data = response.data.horoscope;

    const horoscopeMessage = `
✨ **Гороскоп для ${sign.toUpperCase()} на ${day}:**  
❤️ Совместимость: ${data.compatibility || 'Нет данных'}  
🔢 Счастливое число: ${data.lucky_number || 'Нет данных'}  
⏰ Счастливое время: ${data.lucky_time || 'Нет данных'}  
🎨 Цвет: ${data.color || 'Нет данных'}  
😊 Настроение: ${data.mood || 'Нет данных'}  
📝 Описание: ${data.description || 'Нет данных'}
    `;

    ctx.reply(horoscopeMessage);
  } catch (error) {
    console.error('❌ Ошибка при получении гороскопа:', error.response?.data || error.message);
    ctx.reply(errorMessage || '❌ Произошла ошибка при получении гороскопа. Попробуйте позже.');
  }
}

module.exports = { handleHoroscope };
