import dotenv from 'dotenv';

dotenv.config();

export const BOT_CONFIG = {
  CHECK_INTERVAL: 30000, // Проверка каждые 5 минут
  MAX_RETRIES: 3,
  REACTION_TIMEOUT: 1000,
};

export const API_CONFIG = {
  API_ID: process.env.API_ID,
  API_HASH: process.env.API_HASH,
};

if (!API_CONFIG.API_ID || !API_CONFIG.API_HASH) {
  throw new Error('API_ID or API_HASH is not set in .env file');
}