import { Telegraf, Markup } from 'telegraf';
import { BotContext, Texts, ZodiacSign } from '../types';
import { config } from '../config/env';
import { stateManager } from '../utils/state.manager';
import { getMainMenuButtons } from '../utils/menu.utils';
import {
  showCityMenu,
  handleManualCityInput,
  handleWeatherInput,
  handleWeatherForecast
} from './weather';
import { handleMotivation } from './motivation';
import { handleRates } from './rates';
import { getTimeUntilNewYear } from './newyear';
import { handleListUsers } from './listUsers';
import { saveUser, loadUsers, deleteUser } from '../services/users.service';
import { handleHoroscope } from './horoscope';

const cityList = [
  'Сумы', 'Киев', 'Харьков', 'Львов', 'Одесса', 'Днепр',
  'Чернигов', 'Запорожье', 'Винница', 'Полтава',
  'Черкассы', 'Ивано-Франковск'
];

/**
 * Register all bot handlers
 */
export function registerBotHandlers(bot: Telegraf, texts: Texts): void {
  // Connect user listing logic (admin functionality)
  handleListUsers(bot, texts, config.bot.adminId);

  /**
   * /start command
   */
  bot.start(async (ctx: BotContext) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    const username = ctx.from.username
      ? `@${ctx.from.username}`
      : (ctx.from.first_name || 'noname');

    console.log(`Пользователь ${username} с Telegram ID ${userId} запустил бота.`);

    // Check if there is a user in the database
    try {
      const users = await loadUsers();
      const isExisting = users.some((u) => Number(u.telegramId) === Number(userId));

      if (!isExisting) {
        await saveUser({
          telegramId: userId,
          username,
          createdAt: new Date().toISOString(),
        });
        console.log(`Пользователь ${username} добавлен в Firestore.`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error when validating/adding a user in Firestore:', errorMessage);
    }

    const buttons = getMainMenuButtons(userId, texts);
    await ctx.reply(texts.start_message, Markup.keyboard(buttons).resize());
  });

  /**
   * "How long till New Year's Eve" button
   */
  bot.hears(texts.buttons.new_year, (ctx: BotContext) => {
    const newYearMessageTemplate = texts.messages.new_year_time;
    const timeUntilNewYear = getTimeUntilNewYear(newYearMessageTemplate);
    ctx.reply(timeUntilNewYear);
  });

  /**
   * Today's Weather button
   */
  bot.hears(texts.buttons.weather, async (ctx: BotContext) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    stateManager.updateUserState(userId, {
      weatherState: 'today',
      previousWeatherState: 'today'
    });

    await showCityMenu(ctx);
  });

  /**
   * 3-day weather button
   */
  bot.hears(texts.buttons.weather_3days, async (ctx: BotContext) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    stateManager.updateUserState(userId, {
      weatherState: 'forecast',
      previousWeatherState: 'forecast'
    });

    await showCityMenu(ctx);
  });

  /**
   * Motivation button
   */
  bot.hears(texts.buttons.motivation, async (ctx: BotContext) => {
    await handleMotivation(
      ctx,
      texts.messages.motivation_generating,
      texts.messages.motivation_result,
      texts.messages.motivation_error
    );
  });

  /**
   * Currency rates button
   */
  bot.hears(texts.buttons.rates, async (ctx: BotContext) => {
    await handleRates(
      ctx,
      texts.messages.rates_generating,
      texts.messages.rates_result,
      texts.messages.rates_error
    );
  });

  /**
   * Delete user button (admin)
   */
  bot.hears(texts.buttons.remove_user, (ctx: BotContext) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    if (userId === config.bot.adminId) {
      stateManager.updateUserState(userId, { removeUserState: true });
      ctx.reply('Введите username (с @) или имя, как он отображается в базе, для удаления:');
    } else {
      ctx.reply(texts.messages.no_permission);
    }
  });

  /**
   * To main menu button
   */
  bot.hears(texts.buttons.back_to_main, (ctx: BotContext) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    stateManager.resetUserState(userId);

    const buttons = getMainMenuButtons(userId, texts);
    ctx.reply(texts.start_message, Markup.keyboard(buttons).resize());
  });

  /**
   * Horoscope button
   */
  bot.hears(texts.buttons.horoscope, async (ctx: BotContext) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    stateManager.updateUserState(userId, { horoscopeMenu: true });

    const zodiacButtons = [
      [texts.zodiac_buttons.aries, texts.zodiac_buttons.taurus],
      [texts.zodiac_buttons.gemini, texts.zodiac_buttons.cancer],
      [texts.zodiac_buttons.leo, texts.zodiac_buttons.virgo],
      [texts.zodiac_buttons.libra, texts.zodiac_buttons.scorpio],
      [texts.zodiac_buttons.sagittarius, texts.zodiac_buttons.capricorn],
      [texts.zodiac_buttons.aquarius, texts.zodiac_buttons.pisces],
      [texts.buttons.back_to_main]
    ];

    await ctx.reply(
      texts.messages.horoscope_prompt,
      Markup.keyboard(zodiacButtons).resize()
    );
  });

  /**
   * Handling zodiac sign buttons
   */
  bot.hears([
    texts.zodiac_buttons.aries,
    texts.zodiac_buttons.taurus,
    texts.zodiac_buttons.gemini,
    texts.zodiac_buttons.cancer,
    texts.zodiac_buttons.leo,
    texts.zodiac_buttons.virgo,
    texts.zodiac_buttons.libra,
    texts.zodiac_buttons.scorpio,
    texts.zodiac_buttons.sagittarius,
    texts.zodiac_buttons.capricorn,
    texts.zodiac_buttons.aquarius,
    texts.zodiac_buttons.pisces
  ], async (ctx: BotContext) => {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    const userId = ctx.from.id;
    const userState = stateManager.getUserState(userId);

    if (!userState.horoscopeMenu) {
      await ctx.reply('❌ Пожалуйста, используйте кнопку "🔮 Гороскоп", чтобы выбрать знак зодиака.');
      return;
    }

    const signMap: Record<string, ZodiacSign> = {
      [texts.zodiac_buttons.aries]: 'aries',
      [texts.zodiac_buttons.taurus]: 'taurus',
      [texts.zodiac_buttons.gemini]: 'gemini',
      [texts.zodiac_buttons.cancer]: 'cancer',
      [texts.zodiac_buttons.leo]: 'leo',
      [texts.zodiac_buttons.virgo]: 'virgo',
      [texts.zodiac_buttons.libra]: 'libra',
      [texts.zodiac_buttons.scorpio]: 'scorpio',
      [texts.zodiac_buttons.sagittarius]: 'sagittarius',
      [texts.zodiac_buttons.capricorn]: 'capricorn',
      [texts.zodiac_buttons.aquarius]: 'aquarius',
      [texts.zodiac_buttons.pisces]: 'pisces'
    };

    const selectedSign = signMap[ctx.message.text];
    if (selectedSign) {
      await handleHoroscope(ctx, selectedSign, 'today', texts.messages.horoscope_error);
      stateManager.updateUserState(userId, { horoscopeMenu: false });
    } else {
      await ctx.reply('❌ Неправильный выбор знака зодиака.');
    }
  });

  /**
   * Button "✍️ Enter manually" (in the weather menu)
   */
  bot.hears('✍️ Ввести вручную', (ctx: BotContext) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    stateManager.updateUserState(userId, { weatherState: 'manual_input' });

    handleManualCityInput(ctx);
  });

  bot.hears('🏠 В главное меню', (ctx: BotContext) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    stateManager.resetUserState(userId);

    const buttons = getMainMenuButtons(userId, texts);
    ctx.reply(texts.start_message, Markup.keyboard(buttons).resize());
  });

  /**
   * City list handler
   */
  bot.hears(cityList, async (ctx: BotContext) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    const userState = stateManager.getUserState(userId);

    if (userState.weatherState === 'forecast') {
      await handleWeatherForecast(
        ctx,
        userState,
        texts.messages.weather_3days_result,
        texts.messages.weather_3days_error
      );
    } else {
      await handleWeatherInput(
        ctx,
        userState,
        texts.messages.weather_result,
        texts.messages.weather_error
      );
    }
  });

  /**
   * Text message handler
   */
  bot.on('text', async (ctx: BotContext) => {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    const userId = ctx.from.id;
    const userState = stateManager.getUserState(userId);

    if (userState.removeUserState) {
      const usernameToRemove = ctx.message.text.trim().toLowerCase();

      try {
        const users = await loadUsers();
        const userFound = users.find((u) =>
          u.username.toLowerCase() === usernameToRemove
        );

        if (!userFound) {
          await ctx.reply('Пользователь с таким username не найден в базе.');
        } else {
          if (userFound.docId) {
            await deleteUser(userFound.docId);
            await ctx.reply(`Пользователь ${userFound.username} удалён.`);
          } else {
            await ctx.reply('Ошибка: не найден docId пользователя.');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error when deleting a user from Firestore:', errorMessage);
        await ctx.reply('Произошла ошибка при удалении пользователя.');
      }

      stateManager.updateUserState(userId, { removeUserState: false });
      return;
    }

    if (userState.weatherState === 'manual_input') {
      if (userState.previousWeatherState === 'forecast') {
        await handleWeatherForecast(
          ctx,
          userState,
          texts.messages.weather_3days_result,
          texts.messages.weather_3days_error
        );
      } else {
        await handleWeatherInput(
          ctx,
          userState,
          texts.messages.weather_result,
          texts.messages.weather_error
        );
      }
      return;
    }
  });
}

