import schedule from 'node-schedule';
import { Telegraf } from 'telegraf';
import { loadUsers } from './users.service';
import { getNextYear, getNextNewYearDate, getDecember24Date, getDecember25Date, getDecember28Date, getDecember1Date, getDaysAndMinutesUntilNewYear } from '../utils/date.utils';

export interface ScheduledMessage {
  date: Date;
  message: string | (() => string);
}

/**
 * Schedule message to all users
 */
export function scheduleMessage(bot: Telegraf, date: Date, message: string | (() => string)): void {
  schedule.scheduleJob(date, async () => {
    console.log(`The dispatch scheduler is running: ${new Date()}`);

    // If message is a function, call it to get dynamic message
    const finalMessage = typeof message === 'function' ? message() : message;

    try {
      const users = await loadUsers();
      console.log(`[Scheduler] Starting broadcast to ${users.length} users`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (const user of users) {
        try {
          const telegramId = user.telegramId;
          await bot.telegram.sendMessage(telegramId, finalMessage);
          console.log(`✓ Message sent to user ${user.username || telegramId}`);
          successCount++;
        } catch (userError) {
          const errorMessage = userError instanceof Error ? userError.message : 'Unknown error';
          console.error(`✗ Failed to send to user ${user.username || user.telegramId}: ${errorMessage}`);
          failCount++;
          // Continue to next user even if this one failed
        }
      }
      
      console.log(`[Scheduler] Broadcast completed: ${successCount} sent, ${failCount} failed`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error when loading users for scheduled messages:', errorMessage);
    }
  });
}

/**
 * Initialize all scheduled messages
 */
export function initializeScheduledMessages(bot: Telegraf): void {
  const nextYear = getNextYear();

  // Schedule static messages
  const scheduledMessages: ScheduledMessage[] = [
    {
      date: getDecember1Date(),
      message: () => `До нового року залишилось - ${getDaysAndMinutesUntilNewYear()}`
    },
    {
      date: getDecember28Date(),
      message: 'Привіт! Нагадуємо, що скоро Новий рік. Готуйтеся до свят! 😉🎆" 🎄'
    },
    {
      date: getDecember24Date(),
      message: 'Тест: Привіт! Нагадуємо, що скоро Новий рік. Готуйтеся до свят! 😉🎆" 🎄'
    },
    {
      date: getDecember25Date(),
      message: '🎄✨ З Різдвом Христовим! ✨🎄 Нехай це світле свято принесе у ваш дім радість, затишок і любов. ❤️ Бажаємо вам міцного здоров\'я, душевного спокою та Божої благодаті. 🌟 Нехай у ваших серцях панує віра, надія та любов. 🎁 Мирного неба над головою та щасливых свят! 🕊️🎶'
    },
    {
      date: getNextNewYearDate(),
      message: `🎆✨ З Новим Роком! ✨🎆 Нехай ${nextYear} рік стане роком щастя, здоров'я та здійснення всіх заповітних мрій! 🥂 Бажаємо вам яскравых моментів, теплих зустрічей, невичерпної енергії для нових звершень та мирного неба над головою. 🌟 Зі святом! 🎄🎁😉`
    }
  ];

  scheduledMessages.forEach(({ date, message }) => {
    scheduleMessage(bot, date, message);
  });
}

