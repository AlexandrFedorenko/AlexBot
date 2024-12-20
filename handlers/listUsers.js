module.exports = function handleListUsers(bot, newYearRecipients, texts, ADMIN_ID) {
    bot.hears(texts.buttons.list_recipients, (ctx) => {
      if (ctx.from.id !== ADMIN_ID) {
        return ctx.reply(texts.messages.no_permission);
      }
  
      if (newYearRecipients.length === 0) {
        return ctx.reply(texts.messages.empty_recipients);
      }
  
      const userList = newYearRecipients
        .map((user, index) => `${index + 1}. ${user.username} (ID: ${user.id})`)
        .join('\n');
  
      ctx.reply(`${texts.messages.recipients_list_header}\n\n${userList}`);
    });
  };
  