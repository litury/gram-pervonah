import dotenv from 'dotenv';
import { UserBot } from './modules/UserBotModule/UserBot';
import { ChannelMonitorService } from './modules/ChannelMonitorModule/channelMonitorService';
import { CommentService } from './modules/CommentModule/commentService';
import { logger } from './utils/logger';
import { BOT_CONFIG } from './config/botConfig';

dotenv.config();

const sessionString = process.env.SESSION_STRING;

if (!sessionString) {
  logger.error('SESSION_STRING is not set in .env file');
  process.exit(1);
}

async function main() {
  try {
    const userBot = new UserBot(sessionString as string);
    await userBot.init();

    const channelMonitorService = new ChannelMonitorService(userBot);
    const commentService = new CommentService(userBot);

    channelMonitorService.on('newPost', async (channel, post) => {
      logger.info(`Received newPost event for channel ${channel}, post ${post.id}`);
      await commentService.processPost(channel, post);
    });

    await channelMonitorService.processLastPosts();
    channelMonitorService.startMonitoring(BOT_CONFIG.CHECK_INTERVAL);

    logger.info('Bot started successfully');
  } catch (error) {
    logger.error('Error in main function:', error);
  }
}

main();

process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Closing connections...');
  // Здесь добавьте логику для корректного завершения работы всех сервисов
  process.exit(0);
});