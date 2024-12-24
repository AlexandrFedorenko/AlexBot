const axios = require('axios');

// Конфигурация API
const CLIENT_ID = 'a04a6961-6c42-48d6-8264-21d763926868';
const CLIENT_SECRET = 'hF37jg0FBJd1JkXct6AXGVeZxAtPRn3bdFICtIv';
const API_BASE_URL = 'https://alexbotteg.onrender.com';

// Функция для получения токена
async function getAccessToken() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/token`, 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ Access Token получен:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Ошибка при получении токена:', error.response?.status, error.response?.data || error.message);
    return null;
  }
}

// Функция для проверки доступа к API
async function testAPI() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.error('❌ Не удалось получить токен. Запрос к API невозможен.');
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/api/data`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response:', response.data);
  } catch (error) {
    console.error('❌ Ошибка при доступе к API:', error.response?.status, error.response?.data || error.message);
  }
}

// Запуск тестов
testAPI();
