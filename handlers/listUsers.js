const { loadUsers } = require('../utils/users');

module.exports = function handleListUsers(bot, texts, ADMIN_ID) {
  bot.hears(texts.buttons.list_recipients, async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      return ctx.reply(texts.messages.no_permission);
    }

    const users = await loadUsers();

    if (users.length === 0) {
      return ctx.reply(texts.messages.empty_recipients);
    }

    const userList = users
      .map((user, index) =>
        `${index + 1}. ${user.username} (Telegram ID: ${user.telegramId}) Firestore docId: ${user.docId}`
      )
      .join('\n');

    ctx.reply(`${texts.messages.recipients_list_header}\n\n${userList}`);
  });
};
