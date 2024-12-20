# Telegram Bot 🎉

This is a Telegram bot for automating tasks and interacting with users. It includes the following features:
- **Weather** 🌤: Get current weather information for any city.
- **Motivation** 🌟: Receive motivational quotes.
- **Currency Rates** 💱: Check up-to-date currency exchange rates.
- **Premium Features** 🔒: Access exclusive features through payments.

---

## 🚀 Installation and Setup

Follow these steps to run the bot locally:

### 1. Clone the repository:
```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
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
WEATHER_API_KEY=you_weather_token
NBU_API_URL=you_nbu_token
COINGECKO_API_URL=you_coingecko_token
SECRET_KEY=your_secure_key_32_characters
```

> **Important:** The `SECRET_KEY` must be exactly 32 characters long. It is used for encrypting and decrypting the data.

### 4. Encrypt the recipients file:
Before running the bot, you need to encrypt the `recipients.json` file. Use the provided script:
```bash
node encryptRecipients.js
```

This will generate a file called `recipients.json.enc`, which will be used by the bot.

### 5. Start the bot:
```bash
node bot.js
```

---

## 🔧 Main Commands

- `/start` — Start the bot and display the menu.
- `/my_stars` — Check your star balance.
- `/buy` — Purchase access to premium features.
- `/add_stars @username 10` — (Admin only) Add stars to a user.
- `/premium_feature` — Access exclusive premium features.

---

## 📜 Environment Variables

To configure the bot, you'll need the following environment variables:

### `.env.example`
```plaintext
BOT_API_TOKEN=your_bot_token_from_BotFather
ADMIN_ID=your_telegram_id
WEATHER_API_KEY=your_weather_api_key
NBU_API_URL=https://api.nbu.gov.ua/exchange-rates
COINGECKO_API_URL=https://api.coingecko.com/api/v3
SECRET_KEY=your_secure_key_32_characters
```

Copy this template and rename it to `.env` to set up your local environment.

---

## 🔐 Working with encrypted files

### Encrypt recipients.json
To encrypt the `recipients.json` file, run the following command:
```bash
node encryptRecipients.js
```

This will create an encrypted file `recipients.json.enc` that the bot will use for storing data securely. After encrypting, you can delete the original `recipients.json` for security:
```bash
rm recipients.json
```

### Decrypt recipients.json.enc
If you need to manually view or modify the data, you can use the provided functions in `storage.js` to decrypt the file. For example, create a script to log decrypted data:
```javascript
const { decryptFile } = require('./utils/storage');

const data = decryptFile('recipients.json.enc');
console.log(data);
```

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
