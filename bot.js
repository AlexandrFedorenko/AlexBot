require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const axios = require('axios');
const schedule = require('node-schedule');

const {
  showCityMenu,
  handleManualCityInput,
  handleWeatherInput,
  handleWeatherForecast
} = require('./handlers/weather');

const { handleMotivation } = require('./handlers/motivation');
const { handleRates } = require('./handlers/rates');
const { getTimeUntilNewYear } = require('./handlers/newyear');
const handleListUsers = require('./handlers/listUsers');
const { saveUser, loadUsers, deleteUser } = require('./utils/users');
const { handleHoroscope } = require('./handlers/horoscope');

const BOT_API_TOKEN = process.env.BOT_API_TOKEN;
const ADMIN_ID = parseInt(process.env.ADMIN_ID, 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN;
const PORT = process.env.PORT || 3000;

process.env.TZ = process.env.TIMEZONE || 'UTC';

console.log('🕒 Current Server Time (Local):', new Date().toLocaleString());
console.log('🌍 Current Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

// Check for correct environment variables
if (!BOT_API_TOKEN || isNaN(ADMIN_ID)) {
  console.error('Error: BOT_API_TOKEN или ADMIN_ID не установлены/некорректны в .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_API_TOKEN);
let userStates = {};

/**
 * Load texts from texts.json file
 */
function loadTexts() {
  const filePath = './texts.json';
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      console.error('Error while parsing texts.json:', error.message);
      process.exit(1);
    }
  } else {
    console.error('Error: The texts.json file was not found!');
    process.exit(1);
  }
}

const texts = loadTexts();

// Connect user listing logic (admin functionality)
handleListUsers(bot, texts, ADMIN_ID);

/**
 * ScheduleJob
 */
function scheduleMessage(date, message) {
  schedule.scheduleJob(date, async () => {
    console.log(`The dispatch scheduler is running: ${new Date()}`);

    try {
      const users = await loadUsers();
      for (const user of users) {
        const telegramId = user.telegramId;
        await bot.telegram.sendMessage(telegramId, message);
        console.log(`Message sent to user ${user.username}`);
      }
    } catch (error) {
      console.error('Error when sending scheduled messages:', error.message);
    }
  });
}


const date1 = new Date('2024-12-28T12:00:15');
const message1 = 'Привіт! Нагадуємо, що скоро Новий рік. Готуйтеся до свят! "Хильни чарку 😉🎆" 🎄';

const date4 = new Date('2024-12-24T21:55:15');
const message4 = 'Тест: Привіт! Нагадуємо, що скоро Новий рік. Готуйтеся до свят! "Хильни чарку 😉🎆" 🎄';

const date3 = new Date('2024-12-25T10:00:15');
const message3 = '🎄✨ З Різдвом Христовим! ✨🎄 Нехай це світле свято принесе у ваш дім радість, затишок і любов. ❤️ Бажаємо вам міцного здоров\'я, душевного спокою та Божої благодаті. 🌟 Нехай у ваших серцях панує віра, надія та любов. 🎁 Мирного неба над головою та щасливых свят! 🕊️🎶';

const date2 = new Date('2025-01-01T00:00:00');
const message2 = '🎆✨ З Новим Роком! ✨🎆 Нехай 2025 рік стане роком щастя, здоров\'я та здійснення всіх заповітних мрій! 🥂 Бажаємо вам яскравых моментів, теплих зустрічей, невичерпної енергії для нових звершень та мирного неба над головою. 🌟 Зі святом! 🎄🎁😉';

// Scheduling a shipment
scheduleMessage(date1, message1);
scheduleMessage(date2, message2);
scheduleMessage(date3, message3);
scheduleMessage(date4, message4);

/**
 * /start
 */
bot.start(async (ctx) => {
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
    console.error('Error when validating/adding a user in Firestore:', err.message);
  }

  const buttons = [
    [texts.buttons.new_year, texts.buttons.weather],
    [texts.buttons.weather_3days, texts.buttons.horoscope],
    [texts.buttons.motivation, texts.buttons.rates],
  ];

  if (userId === ADMIN_ID) {
    buttons.push(
      [texts.buttons.remove_user, texts.buttons.list_recipients]
    );
  }

  ctx.reply(texts.start_message, Markup.keyboard(buttons).resize());
});

/**
 * “How long till New Year's Eve” button.
 */
bot.hears(texts.buttons.new_year, (ctx) => {
  const newYearMessageTemplate = texts.messages.new_year_time;
  const timeUntilNewYear = getTimeUntilNewYear(newYearMessageTemplate);
  ctx.reply(timeUntilNewYear);
});

/**
 * Today's Weather button
 */
bot.hears(texts.buttons.weather, async (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = userStates[userId] || {};

  userStates[userId].weatherState = 'today';
  userStates[userId].previousWeatherState = 'today';

  await showCityMenu(ctx);
});

/**
 * 3-day weather button
 */
bot.hears(texts.buttons.weather_3days, async (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = userStates[userId] || {};

  // 3-Day Mode
  userStates[userId].weatherState = 'forecast';
  userStates[userId].previousWeatherState = 'forecast';

  await showCityMenu(ctx);
});

/**
 * Motivation button
 */
bot.hears(texts.buttons.motivation, async (ctx) => {
  await handleMotivation(
    ctx,
    texts.messages.motivation_generating,
    texts.messages.motivation_result,
    texts.messages.motivation_error,
    texts
  );
});

/**
 * Currency rates button
 */
bot.hears(texts.buttons.rates, async (ctx) => {
  await handleRates(
    ctx,
    texts.messages.rates_generating,
    texts.messages.rates_result,
    texts.messages.rates_error
  );
});

/**
 * Delete user” button (admin)
 */
bot.hears(texts.buttons.remove_user, (ctx) => {
  const userId = ctx.from.id;
  if (userId === ADMIN_ID) {
    userStates[userId] = userStates[userId] || {};
    userStates[userId].removeUserState = true;
    ctx.reply('Введите username (с @) или имя, как он отображается в базе, для удаления:');
  } else {
    ctx.reply(texts.messages.no_permission);
  }
});

/**
 * To main menu button
 */
bot.hears(texts.buttons.back_to_main, (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = {};

  const buttons = [
    [texts.buttons.new_year, texts.buttons.weather],
    [texts.buttons.weather_3days, texts.buttons.horoscope],
    [texts.buttons.motivation, texts.buttons.rates],
  ];

  if (userId === ADMIN_ID) {
    buttons.push(
      [texts.buttons.remove_user, texts.buttons.list_recipients]
    );
  }

  ctx.reply(texts.start_message, Markup.keyboard(buttons).resize());
});

/**
 * Horoscope button
 */
bot.hears(texts.buttons.horoscope, (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = userStates[userId] || {};
  userStates[userId].horoscopeMenu = true;

  const zodiacButtons = [
    [texts.zodiac_buttons.aries, texts.zodiac_buttons.taurus],
    [texts.zodiac_buttons.gemini, texts.zodiac_buttons.cancer],
    [texts.zodiac_buttons.leo, texts.zodiac_buttons.virgo],
    [texts.zodiac_buttons.libra, texts.zodiac_buttons.scorpio],
    [texts.zodiac_buttons.sagittarius, texts.zodiac_buttons.capricorn],
    [texts.zodiac_buttons.aquarius, texts.zodiac_buttons.pisces],
    [texts.buttons.back_to_main]
  ];

  ctx.reply(
    texts.messages.horoscope_prompt,
    Markup.keyboard(zodiacButtons).resize()
  );
});

/**
 * Handling zodiac sign buttons (if user is in 'horoscope_menu' mode)
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
], async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId] || {};

  if (!userState.horoscopeMenu) {
    return ctx.reply('❌ Пожалуйста, используйте кнопку "🔮 Гороскоп", чтобы выбрать знак зодиака.');
  }

  const signMap = {
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
    userState.horoscopeMenu = false;
  } else {
    ctx.reply('❌ Неправильный выбор знака зодиака.');
  }
});

/**
 * Button “✍️ Enter manually” (in the weather menu).
 */
bot.hears('✍️ Ввести вручную', (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = userStates[userId] || {};
 
  userStates[userId].weatherState = 'manual_input';

  handleManualCityInput(ctx);
});

bot.hears('🏠 В главное меню', (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = {};

  const buttons = [
    [texts.buttons.new_year, texts.buttons.weather],
    [texts.buttons.weather_3days, texts.buttons.horoscope],
    [texts.buttons.motivation, texts.buttons.rates],
  ];

  if (userId === ADMIN_ID) {
    buttons.push(
      [texts.buttons.remove_user, texts.buttons.list_recipients]
    );
  }

  ctx.reply(texts.start_message, Markup.keyboard(buttons).resize());
});

const cityList = [
  'Сумы', 'Киев', 'Харьков', 'Львов', 'Одесса', 'Днепр',
  'Чернигов', 'Запорожье', 'Винница', 'Полтава',
  'Черкассы', 'Ивано-Франковск'
];

bot.hears(cityList, async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId] || {};

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

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId] || {};

  if (userState.removeUserState) {
    const usernameToRemove = ctx.message.text.trim().toLowerCase();

    try {
      const users = await loadUsers();
      const userFound = users.find((u) =>
        u.username.toLowerCase() === usernameToRemove
      );

      if (!userFound) {
        ctx.reply('Пользователь с таким username не найден в базе.');
      } else {
        await deleteUser(userFound.docId);
        ctx.reply(`Пользователь ${userFound.username} удалён.`);
      }
    } catch (err) {
      console.error('Error when deleting a user from Firestore:', err.message);
      ctx.reply('Произошла ошибка при удалении пользователя.');
    }

    userState.removeUserState = false;
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

/**
 * Start Bot
 */
if (isProduction) {
  bot.launch({
    webhook: {
      domain: WEBHOOK_DOMAIN,
      port: PORT,
    },
  });
  console.log('🚀 Bot launched in webhook mode');
} else {
  bot.launch();
  console.log('🚀 Bot launched in polling mode');
}

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


setInterval(async () => {
  try {
    await bot.telegram.getMe();
    console.log('✅ Keep-Alive via Telegram (getMe) executed successfully');
  } catch (err) {
    console.error('❌ Keep-Alive via Telegram (getMe) failed:', err.message);
  }
}, 420000);