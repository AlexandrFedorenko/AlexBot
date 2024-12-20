// utils/text.js

const fs = require('fs');

function loadTexts() {
  const filePath = './texts.json';
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      console.error('Помилка при парсингу texts.json:', error.message);
      process.exit(1);
    }
  } else {
    console.error('Помилка: Файл texts.json не знайдено!');
    process.exit(1);
  }
}

module.exports = { loadTexts };
