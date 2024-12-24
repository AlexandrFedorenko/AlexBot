const axios = require('axios');

/**
 * Handles request for exchange rates for currencies, precious metals and cryptocurrencies.
 * @param {Context} ctx - Message Context.
 * @param {string} generatingMessage - Course Generation Message.
 * @param {string} resultMessage - Results Message Template.
 * @param {string} errorMessage - Error message.
 */
async function handleRates(ctx, generatingMessage, resultMessage, errorMessage) {
  ctx.reply(generatingMessage);

  try {
    const currencyResponse = await axios.get(process.env.NBU_API_URL);
    const currencyData = currencyResponse.data;

    const cryptoResponse = await axios.get(process.env.COINGECKO_API_URL, {
      params: {
        ids: 'bitcoin,ethereum,solana,the-open-network,dogecoin',
        vs_currencies: 'usd'
      },
    });
    const cryptoData = cryptoResponse.data;

    // Getting cryptocurrency data with verification
    const bitcoin = cryptoData?.bitcoin?.usd || 'N/A';
    const ethereum = cryptoData?.ethereum?.usd || 'N/A';
    const solana = cryptoData?.solana?.usd || 'N/A';
    const toncoin = cryptoData?.['the-open-network']?.usd || 'N/A';
    const dogecoin = cryptoData?.dogecoin?.usd || 'N/A';

    // Generating data for the message
    const currencies = `
- Доллар: ${getCurrencyRate(currencyData, 'USD')} UAH
- Евро: ${getCurrencyRate(currencyData, 'EUR')} UAH
- Фунт: ${getCurrencyRate(currencyData, 'GBP')} UAH`;

    const metals = `
- Золото: ${getCurrencyRate(currencyData, 'XAU')} UAH
- Серебро: ${getCurrencyRate(currencyData, 'XAG')} UAH
- Платина: ${getCurrencyRate(currencyData, 'XPT')} UAH`;

    const cryptos = `
- Биткоин: ${bitcoin} USD
- Эфир: ${ethereum} USD
- Солана: ${solana} USD
- Тонкоин: ${toncoin} USD
- Доги: ${dogecoin} USD`;

    const ratesMessage = resultMessage
      .replace('{currencies}', currencies.trim())
      .replace('{metals}', metals.trim())
      .replace('{cryptos}', cryptos.trim());

    ctx.reply(ratesMessage);
  } catch (error) {
    console.error('Course Receipt Error:', error.message);
    ctx.reply(errorMessage);
  }
}

/**
 * Gets the currency rate from the NBU data.
 * @param {Array} currencyData - Currency data from the NBU.
 * @param {string} currencyCode - Currency code.
 * @returns {string}  Currency exchange rate.
 */
function getCurrencyRate(currencyData, currencyCode) {
  const currency = currencyData.find((item) => item.cc === currencyCode);
  return currency ? currency.rate.toFixed(2) : 'N/A';
}

module.exports = { handleRates };
