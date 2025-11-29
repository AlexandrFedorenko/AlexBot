import axios from 'axios';
import { translate } from '@vitalets/google-translate-api';
import { BotContext, MotivationResponse } from '../types';

/**
 * Processes a request for a motivational quote.
 */
export async function handleMotivation(
  ctx: BotContext,
  generatingMessage: string,
  resultMessage: string,
  errorMessage: string
): Promise<void> {
  await ctx.reply(generatingMessage);
  
  try {
    const response = await axios.get<MotivationResponse>('https://qapi.vercel.app/api/random');
    const quote = response.data;
    const originalText = `"${quote.quote}" - ${quote.author}`;
    
    const { text: translatedText } = await translate(originalText, { to: 'ru' });
    await ctx.reply(resultMessage.replace('{quote}', translatedText));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in obtaining a motivational quote:', errorMsg);
    await ctx.reply(errorMessage);
  }
}

