import { Texts } from '../types';
import { config } from '../config/env';

/**
 * Get main menu buttons based on user role
 */
export function getMainMenuButtons(userId: number, texts: Texts): string[][] {
  const buttons: string[][] = [
    [texts.buttons.new_year, texts.buttons.weather],
    [texts.buttons.weather_3days, texts.buttons.horoscope],
    [texts.buttons.cocktail, texts.buttons.rates],
  ];

  if (userId === config.bot.adminId) {
    buttons.push(
      [texts.buttons.remove_user, texts.buttons.list_recipients]
    );
  }

  return buttons;
}

