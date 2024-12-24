# Telegram Bot 🎉

This is a Telegram bot for automating tasks and interacting with users. It includes the following features:
- **Weather** 🌤: Get current weather information for any city.
- **Motivation** 🌟: Receive motivational quotes.
- **Currency Rates** 💱: Check up-to-date currency exchange rates.
- **Horoscope** 🔮: Get daily horoscopes for your zodiac sign.
- **Admin Features** 🔑: Manage users and send announcements.

---

## 🚀 Installation and Setup

Follow these steps to run the bot locally:

### 1. Clone the repository:
```bash
git clone https://github.com/AlexandrFedorenko/AlexBot.git
cd AlexBot
```

### 2. Install dependencies:
Ensure you have Node.js version 14 or higher installed.
```bash
npm install
```

### 3. Configure environment variables:
Create a `.env` file in the project's root directory and add the following:
```
BOT_API_TOKEN=your_bot_token_from_BotFather
ADMIN_ID=your_telegram_id
WEATHER_API_KEY=your_weather_token
NBU_API_URL=https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json
COINGECKO_API_URL=https://api.coingecko.com/api/v3/simple/price
SECRET_KEY=your_secure_key_32_characters
HOROSCOPE_API_URL=https://horoscope19.p.rapidapi.com/get-horoscope/daily
HOROSCOPE_API_KEY=your_horoscope_api_key
HOROSCOPE_API_HOST=horoscope19.p.rapidapi.com
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=path_to_your_firebase_key.json
WEBHOOK_DOMAIN=your_webhook_domain
PORT=3000
TIMEZONE=Europe/Berlin
```

> **Important:** The `SECRET_KEY` must be exactly 32 characters long. It is used for encrypting and decrypting the data.

### 4. Start the bot:
```bash
node bot.js
```

For production environments, you can use PM2:
```bash
npm install -g pm2
pm start bot.js --name telegram_bot
```

---

## 🔧 Main Commands

- `/start` — Start the bot and display the menu.
- `/weather` — Get weather information.
- `/motivation` — Receive a motivational quote.
- `/rates` — Get current currency exchange rates.
- `/horoscope` — View your daily horoscope.
- `/remove_user` — (Admin only) Remove a user from the system.
- `/list_recipients` — (Admin only) View all registered users.

---

## 📜 Environment Variables

To configure the bot, you'll need the following environment variables:

### `.env.example`
```plaintext
BOT_API_TOKEN=your_bot_token_from_BotFather
ADMIN_ID=your_telegram_id
WEATHER_API_KEY=your_weather_token
NBU_API_URL=https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json
COINGECKO_API_URL=https://api.coingecko.com/api/v3/simple/price
SECRET_KEY=your_secure_key_32_characters
HOROSCOPE_API_URL=https://horoscope19.p.rapidapi.com/get-horoscope/daily
HOROSCOPE_API_KEY=your_horoscope_api_key
HOROSCOPE_API_HOST=horoscope19.p.rapidapi.com
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=path_to_your_firebase_key.json
WEBHOOK_DOMAIN=your_webhook_domain
PORT=3000
TIMEZONE=Europe/Berlin
```

Copy this template and rename it to `.env` to set up your local environment.

---

## 🌐 Webhook Configuration

For production use, it's recommended to set up a webhook:
```bash
node bot.js --webhook
```

Ensure your webhook domain and port are correctly configured in the `.env` file.

---

## 🔐 Working with Firebase Database

All user data is securely stored in **Firebase Firestore**. Make sure your `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` points to the correct service account JSON file provided by Firebase.

### Firebase Setup:
1. Go to your Firebase Console.
2. Create or select a project.
3. Download the service account JSON file.
4. Place it in your project root and update the `.env` variable:
```plaintext
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./your_firebase_key.json
```

### Managing Users via Bot
- Use `/list_recipients` to view all registered users.
- Use `/remove_user` to remove a user from the database.

---

## 🤝 Contribution

We welcome contributions and suggestions! To contribute:
1. Fork this repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m "Description of your changes"`.
4. Push the branch: `git push origin feature-name`.
5. Open a pull request.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🛡️ Support

For any issues, please open an [issue on GitHub](https://github.com/AlexandrFedorenko/AlexBot/issues) or contact the admin directly via Telegram.

