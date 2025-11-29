import axios from 'axios';
import { BotContext, CurrencyRate, CryptoResponse } from '../types';
import { config } from '../config/env';

/**
 * Gets the currency rate from the NBU data.
 */
function getCurrencyRate(currencyData: CurrencyRate[], currencyCode: string): string {
  const currency = currencyData.find((item) => item.cc === currencyCode);
  return currency ? currency.rate.toFixed(2) : 'N/A';
}

/**
 * Handles request for exchange rates for currencies, precious metals and cryptocurrencies.
 */
export async function handleRates(
  ctx: BotContext,
  generatingMessage: string,
  resultMessage: string,
  _errorMessage: string
): Promise<void> {
  await ctx.reply(generatingMessage);

  try {
    const currencyResponse = await axios.get<CurrencyRate[]>(config.apis.nbu.url);
    const currencyData = currencyResponse.data;

    const cryptoResponse = await axios.get<CryptoResponse>(config.apis.coingecko.url, {
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

    await ctx.reply(ratesMessage);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Course Receipt Error:', errorMessage);
    await ctx.reply(errorMessage);
  }
}

