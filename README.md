# Telegram UserBot

Telegram UserBot - это автоматизированный бот для мониторинга каналов Telegram и взаимодействия с постами через комментарии и реакции.

---

## Назначение комплекса

Telegram UserBot предназначен для автоматизации взаимодействия с каналами Telegram. Комплекс позволяет мониторить выбранные каналы, реагировать на новые посты и оставлять комментарии. Основная цель комплекса — упростить процесс взаимодействия с контентом в Telegram каналах.

## Состав комплекса

### 1. **Модуль UserBot**
- `UserBot.ts`: Основной класс для взаимодействия с API Telegram.
- `userBotService.ts`: Сервис, управляющий функциональностью UserBot.
- `interfaces/IUserBot.ts`: Интерфейс для UserBot.

### 2. **Модуль ChannelMonitor**
- `channelMonitorService.ts`: Сервис для мониторинга каналов и обнаружения новых постов.
- `interfaces/IChannelMonitor.ts`: Интерфейс для ChannelMonitor.

### 3. **Модуль CommentService**
- `commentService.ts`: Сервис для генерации и отправки комментариев.
- `interfaces/ICommentService.ts`: Интерфейс для CommentService.

### 4. **Модуль SimilarChannels**
- `similarChannelsService.ts`: Сервис для поиска похожих каналов и проверки доступности комментариев.

### 5. **Конфигурационный модуль**
- `config/botConfig.ts`: Содержит настройки бота и API конфигурацию.
- `config/channelList.ts`: Список отслеживаемых каналов.

### 6. **Утилиты**
- `utils/helpers.ts`: Вспомогательные функции.
- `utils/logger.ts`: Модуль для логирования.

### 7. **Генерация сессии**
- `generateSession.ts`: Скрипт для генерации строки сессии.

## Функциональность и принципы работы

### 1. **Модуль UserBot**

UserBot обеспечивает базовое взаимодействие с API Telegram.

**Основные функции:**
- Инициализация клиента Telegram
- Получение сообщений из каналов
- Реакции на посты
- Отправка комментариев
- Присоединение к каналам

**Пример использования:**
```typescript
const userBot = new UserBot(sessionString);
await userBot.init();
const messages = await userBot.getMessages(channelId, 5);
```

### 2. **Модуль ChannelMonitor**

ChannelMonitor отслеживает новые посты в указанных каналах.

**Основные функции:**
- Периодическая проверка каналов
- Обнаружение новых постов
- Эмиссия событий о новых постах

**Пример использования:**
```typescript
const channelMonitor = new ChannelMonitorService(userBot);
channelMonitor.on('newPost', async (channel, post) => {
// Обработка нового поста
});
channelMonitor.startMonitoring(CHECK_INTERVAL);
```
### 3. **Модуль CommentService**

CommentService управляет процессом комментирования постов.

**Основные функции:**
- Генерация комментариев
- Отправка комментариев к постам

**Пример использования:**
```typescript
const commentService = new CommentService(userBot);
await commentService.processPost(channelId, postId);
```

## Технологии

- TypeScript
- Node.js
- GramJS (Telegram API library)

## Установка и запуск

1. Клонируйте репозиторий:
   ```
   git clone [URL репозитория]
   ```

2. Установите зависимости:
   ```
   npm install
   ```

3. Создайте файл `.env` и заполните его необходимыми данными:
   ```
   API_ID=ваш_api_id
   API_HASH=ваш_api_hash
   SESSION_STRING=ваша_строка_сессии
   ```

4. Сгенерируйте строку сессии:
   ```
   npm run generate-session
   ```

5. Запустите бота:
   ```
   npm run dev
   ```

## Особенности

- Автоматический мониторинг нескольких каналов Telegram
- Настраиваемые интервалы проверки и реакции
- Гибкая система генерации комментариев
- Обработка ограничений API Telegram (например, флуд-контроль)
- Поиск похожих каналов и проверка доступности комментариев

## Разработка и расширение

Проект имеет модульную структуру, что позволяет легко расширять его функциональность. Для добавления новых возможностей:

1. Создайте новый модуль в директории `src/modules/`
2. Реализуйте необходимую логику
3. Интегрируйте новый модуль в основное приложение через `src/index.ts`

## Вклад в проект

Мы приветствуем вклад в развитие проекта! Пожалуйста, следуйте этим шагам:

1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте изменения в ваш форк (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request
