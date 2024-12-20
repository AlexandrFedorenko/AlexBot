function getTimeUntilNewYear(messageTemplate) {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
  const diff = nextYear - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return messageTemplate
    .replace('{days}', days)
    .replace('{hours}', hours)
    .replace('{minutes}', minutes);
}

function scheduleNewYearMessage(bot, newYearRecipients, messageTemplate) {

  if (newYearRecipients.length === 0) {
    console.error('The recipient list is empty. The message has not been sent.');
    return;
  }

  const message = getTimeUntilNewYear(messageTemplate);

  newYearRecipients.forEach((recipient) => {
    bot.telegram.sendMessage(recipient.id, message)
      .then(() => console.log(`Message sent to user ${recipient.username}`))
      .catch((error) => console.error(`Error when sending to user ${recipient.username}:`, error.message));
  });
}

module.exports = { getTimeUntilNewYear, scheduleNewYearMessage };
