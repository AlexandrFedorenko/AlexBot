import { Telegraf } from 'telegraf';
import { BotContext, Texts } from '../types';
import { loadUsers } from '../services/users.service';

export function handleListUsers(bot: Telegraf, texts: Texts, ADMIN_ID: number): void {
  bot.hears(texts.buttons.list_recipients, async (ctx: BotContext) => {
    if (ctx.from?.id !== ADMIN_ID) {
      await ctx.reply(texts.messages.no_permission);
      return;
    }

    const users = await loadUsers();

    if (users.length === 0) {
      await ctx.reply(texts.messages.empty_recipients);
      return;
    }

    const userList = users
      .map((user, index) =>
        `${index + 1}. ${user.username} (Telegram ID: ${user.telegramId}) Firestore docId: ${user.docId || 'N/A'}`
      )
      .join('\n');

    await ctx.reply(`${texts.messages.recipients_list_header}\n\n${userList}`);
  });
}

