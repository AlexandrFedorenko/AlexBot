function handleRecipientCommands(bot, recipients, saveRecipients, texts, adminId, userStates) {
  // Handler for the “❌ Remove from list” button for the administrator
  bot.hears(texts.buttons.remove_user, (ctx) => {
    const senderId = ctx.from.id;

    if (senderId !== adminId) {
      ctx.reply(texts.messages.no_permission);
      return;
    }

    // Set the state for entering the user's username to delete
    userStates[senderId] = 'remove_username';
    ctx.reply(texts.messages.remove_manual_prompt);
  });

  // Button handler “🎁 Congratulations list” for the administrator
  bot.hears(texts.buttons.list_recipients, (ctx) => {
    const senderId = ctx.from.id;

    if (senderId !== adminId) {
      ctx.reply(texts.messages.no_permission);
      return;
    }

    if (recipients.length === 0) {
      ctx.reply(texts.messages.empty_recipients);
      return;
    }

    const list = recipients.map((user, index) => `${index + 1}. ${user.username}`).join('\n');
    ctx.reply(`${texts.messages.recipients_list_header}\n${list}`);
  });

  // Button handler “✉️ Test mailing” for the administrator
  bot.hears(texts.buttons.test_broadcast, async (ctx) => {
    const senderId = ctx.from.id;

    if (senderId !== adminId) {
      ctx.reply(texts.messages.no_permission);
      return;
    }

    if (recipients.length === 0) {
      ctx.reply(texts.messages.empty_recipients);
      return;
    }

    try {
      for (const recipient of recipients) {
        if (!recipient.id) {          
          continue;
        }
        await bot.telegram.sendMessage(recipient.id, texts.messages.test_broadcast_message);
      }
      ctx.reply(texts.messages.test_broadcast_success);
    } catch (error) {
      ctx.reply(texts.messages.test_broadcast_error);
      console.error('Error with a test email campaign', error);
    }
  });
}

module.exports = { handleRecipientCommands };
