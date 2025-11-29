import { Telegraf } from 'telegraf';
import { config } from './config/env';
import { loadTexts } from './config/texts';
import { registerBotHandlers } from './handlers/bot.handlers';
import { initializeScheduledMessages } from './services/scheduler.service';

/**
 * Initialize and start the bot
 */
async function startBot(): Promise<void> {
  // Initialize bot
  const bot = new Telegraf(config.bot.token);

  // Load texts
  const texts = loadTexts();

  // Register all handlers
  registerBotHandlers(bot, texts);

  // Initialize scheduled messages
  initializeScheduledMessages(bot);

  // Start bot
  try {
    await bot.launch();
    console.log(`[${new Date().toISOString()}] 🚀 Bot launched in POLLING mode`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[${new Date().toISOString()}] ❌ Failed to launch bot:`, errorMessage);
    process.exit(1);
  }

  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// Start the bot
startBot().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('Fatal error:', errorMessage);
  process.exit(1);
});
