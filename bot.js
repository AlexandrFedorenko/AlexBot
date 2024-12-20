require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const axios = require('axios');
const schedule = require('node-schedule');

const { handleWeatherInput } = require('./handlers/weather');
const { handleMotivation } = require('./handlers/motivation');
const { handleRates } = require('./handlers/rates');
const { getTimeUntilNewYear } = require('./handlers/newyear');
const handleListUsers = require('./handlers/listUsers');
const { loadRecipients, saveRecipients } = require('./utils/storage');
const { handleRecipientCommands } = require('./handlers/recipients');


const BOT_API_TOKEN = process.env.BOT_API_TOKEN;
const ADMIN_ID = parseInt(process.env.ADMIN_ID, 10);

if (!BOT_API_TOKEN || isNaN(ADMIN_ID)) {
  console.error('Error: BOT_API_TOKEN or ADMIN_ID is not set or is incorrect in the .env file.');
  process.exit(1);
}

const bot = new Telegraf(BOT_API_TOKEN);
let userStates = {};
let newYearRecipients = loadRecipients();

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

handleListUsers(bot, newYearRecipients, texts, ADMIN_ID);

// Scheduling the sending of messages
function scheduleMessage(date, message) {
  schedule.scheduleJob(date, () => {
    console.log(`The dispatch scheduler is running: ${new Date()}`);
    newYearRecipients.forEach((recipient) => {
      bot.telegram.sendMessage(recipient.id, message)
        .then(() => console.log(`Message sent to user ${recipient.username}`))
        .catch((error) =>
          console.error(`Error when sending a message to a user ${recipient.username}:`, error.message)
        );
    });
  });
}

// Scheduled messages
const date1 = new Date('2024-12-22T15:15:15');
const message1 = 'Привет! Напоминаем, что скоро Новый год. Готовьтесь к праздникам! 🎄';

const date2 = new Date('2024-12-31T00:00:00');
const message2 = '🎉 С Новым годом! Желаем вам счастья, здоровья и удачи в 2025 году!';

scheduleMessage(date1, message1);
scheduleMessage(date2, message2);

// Handler for the /start command
bot.start((ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.first_name}`;

  console.log(`Пользователь ${username} с ID ${userId} запустил бота.`);

  if (!newYearRecipients.some((user) => user.id === userId)) {
    newYearRecipients.push({ username, id: userId });
    saveRecipients(newYearRecipients);
    console.log(`Пользователь ${username} добавлен в список.`);
  }

  const buttons = [
    [texts.buttons.new_year, texts.buttons.weather],
    [texts.buttons.motivation, texts.buttons.rates],
    [texts.buttons.add_self],
  ];

  if (userId === ADMIN_ID) {
    buttons.push(
      [texts.buttons.remove_user, texts.buttons.test_broadcast],
      [texts.buttons.list_recipients]
    );
  }

  ctx.reply(texts.start_message, Markup.keyboard(buttons).resize());
});

bot.hears(texts.buttons.new_year, (ctx) => {
  const newYearMessageTemplate = texts.messages.new_year_time; 
  const timeUntilNewYear = getTimeUntilNewYear(newYearMessageTemplate);
  ctx.reply(timeUntilNewYear); 
});

bot.hears(texts.buttons.weather, (ctx) => {
  userStates[ctx.from.id] = 'weather';
  ctx.reply(texts.messages.weather_prompt);
});

bot.hears(texts.buttons.motivation, async (ctx) => {
  await handleMotivation(ctx, texts.messages.motivation_generating, texts.messages.motivation_result, texts.messages.motivation_error, texts);
});

bot.hears(texts.buttons.rates, async (ctx) => {
  await handleRates(ctx, texts.messages.rates_generating, texts.messages.rates_result, texts.messages.rates_error);
});

bot.hears(texts.buttons.add_self, (ctx) => {
  const username = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.first_name}`;
  const userId = ctx.from.id;

  if (newYearRecipients.some((user) => user.id === userId || user.username === username)) {
    ctx.reply(texts.messages.already_in_list);
    return;
  }

  newYearRecipients.push({ username, id: userId });
  saveRecipients(newYearRecipients);

  ctx.reply(texts.messages.added_to_list.replace('{username}', username));
});

handleRecipientCommands(bot, newYearRecipients, saveRecipients, texts, ADMIN_ID, userStates);

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const state = userStates[userId];

  if (state === 'weather') {
    await handleWeatherInput(ctx, texts.messages.weather_result, texts.messages.weather_error, texts);
    userStates[userId] = null;
  }

  if (state === 'remove_username') {
    const usernameToRemove = ctx.message.text.trim().toLowerCase();
    const index = newYearRecipients.findIndex((user) => user.username.toLowerCase() === usernameToRemove);

    if (index === -1) {
      ctx.reply(texts.messages.remove_manual_error);
      userStates[userId] = null;
      return;
    }

    const removedUser = newYearRecipients.splice(index, 1)[0];
    saveRecipients(newYearRecipients);
    console.log(`Пользователь ${removedUser.username} удален из списка.`);
    ctx.reply(texts.messages.remove_manual_success.replace('{username}', removedUser.username));
    userStates[userId] = null;
  }
});

bot.launch();
console.log('🚀 The bot is up and running and ready to go!');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
