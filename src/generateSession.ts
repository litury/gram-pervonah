import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import prompts from 'prompts';
import dotenv from 'dotenv';

dotenv.config();

const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;

if (!apiId || !apiHash) {
  console.error('API_ID or API_HASH is not set in .env file');
  process.exit(1);
}

(async () => {
  const client = new TelegramClient(new StringSession(""), Number(apiId), apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => (await prompts({ type: 'text', name: 'phone', message: 'Введите номер телефона:' })).phone,
    password: async () => (await prompts({ type: 'password', name: 'password', message: 'Введите пароль:' })).password,
    phoneCode: async () => (await prompts({ type: 'text', name: 'code', message: 'Введите код подтверждения:' })).code,
    onError: (err) => console.log(err),
  });

  console.log("Вот ваш SESSION_STRING. Сохраните его в .env файл:");
  console.log(client.session.save());
  await client.disconnect();
})();