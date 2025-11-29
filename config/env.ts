import dotenv from 'dotenv';

dotenv.config();

export const config = {
  bot: {
    token: process.env.BOT_API_TOKEN || '',
    adminId: parseInt(process.env.ADMIN_ID || '0', 10),
  },
  timezone: process.env.TIMEZONE || 'UTC',
  apis: {
    weather: {
      key: process.env.WEATHER_API_KEY || '',
    },
    horoscope: {
      url: process.env.HOROSCOPE_API_URL || '',
      key: process.env.HOROSCOPE_API_KEY || '',
      host: process.env.HOROSCOPE_API_HOST || '',
    },
    nbu: {
      url: process.env.NBU_API_URL || '',
    },
    coingecko: {
      url: process.env.COINGECKO_API_URL || '',
    },
  },
  firebase: {
    serviceAccountKeyPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || '',
  },
};

// Validate required environment variables
if (!config.bot.token || isNaN(config.bot.adminId)) {
  console.error('Error: BOT_API_TOKEN или ADMIN_ID не установлены/некорректны в .env');
  process.exit(1);
}

// Set timezone
process.env.TZ = config.timezone;

console.log('🕒 Current Server Time (Local):', new Date().toLocaleString());
console.log('🌍 Current Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

