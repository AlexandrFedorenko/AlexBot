const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');

/**
 * Processes a request for a motivational quote.
 * @param {Context} ctx -  Message Context.
 * @param {string} generatingMessage - Citation Generation Message.
 * @param {string} resultMessage - Quote Message Template.
 * @param {string} errorMessage - Error message.
 * @param {object} texts - Text message object.
 */

async function handleMotivation(ctx, generatingMessage, resultMessage, errorMessage, texts) {
  ctx.reply(generatingMessage);
  try {
    const response = await axios.get('https://qapi.vercel.app/api/random');
    const quote = response.data;
    const originalText = `"${quote.quote}" - ${quote.author}`;
    
    const { text: translatedText } = await translate(originalText, { to: 'ru' });
    ctx.reply(resultMessage.replace('{quote}', translatedText));
  } catch (error) {
    console.error('Error in obtaining a motivational quote:', error.message);
    ctx.reply(errorMessage);
  }
}

module.exports = { handleMotivation };
