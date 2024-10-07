import { UserBot } from './UserBot';
import { CHANNELS } from '../../config/channelList';
import { BOT_CONFIG } from '../../config/botConfig';
import { logger } from '../../utils/logger';
import { sleep } from '../../utils/helpers';

export class UserBotService {
  private userBot: UserBot;
  private lastProcessedMessageIds: Map<string, number> = new Map();

  constructor(sessionString: string) {
    this.userBot = new UserBot(sessionString);
  }

  async init() {
    await this.userBot.init();
    await this.joinChannels();
    await this.processLastPosts();
  }

  async joinChannels() {
    for (const channel of CHANNELS) {
      try {
        const isMember = await this.userBot.isChannelMember(channel);
        logger.info(`Checking membership for channel ${channel}: ${isMember ? 'Member' : 'Not a member'}`);
        if (!isMember) {
          await this.userBot.joinChannel(channel);
        }
      } catch (error) {
        logger.error(`Error joining channel ${channel}:`, error);
      }
    }
  }

  async processLastPosts() {
    for (const channel of CHANNELS) {
      try {
        const messages = await this.userBot.getMessages(channel, 5);
        logger.info(`Fetched ${messages.length} messages from ${channel}`);
        if (messages.length > 0) {
          await this.processMessagesSequentially(channel, messages);
          // Сохраняем ID последнего обработанного сообщения
          this.lastProcessedMessageIds.set(channel, messages[0].id);
        } else {
          logger.info(`No messages found in ${channel}`);
        }
      } catch (error) {
        logger.error(`Error processing last posts in ${channel}:`, error);
      }
    }
  }

  async processMessagesSequentially(channel: string, messages: any[]) {
    for (const message of messages) {
      if (!message.groupedId) {
        const success = await this.processMessage(channel, message);
        if (success) break;
      } else {
        logger.info(`Skipping message ${message.id} in ${channel} as it's part of a media group`);
      }
    }
  }

  async processMessage(channel: string, message: any): Promise<boolean> {
    logger.info(`Processing message ${message.id} in ${channel}`);
    logger.info(`Reacting to message ${message.id} in ${channel}`);
    await this.userBot.reactToPost(channel, message.id, '👍');
    
    const comment = this.generateComment();
    logger.info(`Attempting to comment on message ${message.id} in ${channel}`);
    const commentSuccess = await this.userBot.commentOnPost(channel, message.id, comment);

    if (commentSuccess) {
      await sleep(BOT_CONFIG.REACTION_TIMEOUT);
      return true;
    } else {
      logger.warn(`Failed to comment on message ${message.id} in ${channel}. Moving to the next message.`);
      return false;
    }
  }

  async monitorChannels() {
    logger.info('Starting channel monitoring');
    for (const channel of CHANNELS) {
      try {
        const lastProcessedId = this.lastProcessedMessageIds.get(channel) || 0;
        const messages = await this.userBot.getMessages(channel, 5);
        logger.info(`Fetched ${messages.length} messages from ${channel}`);
        
        const newMessages = messages.filter(msg => msg.id > lastProcessedId);
        if (newMessages.length > 0) {
          logger.info(`Found ${newMessages.length} new messages in ${channel}`);
          await this.processMessagesSequentially(channel, newMessages);
          // Обновляем ID последнего обработанного сообщения
          this.lastProcessedMessageIds.set(channel, newMessages[0].id);
        } else {
          logger.info(`No new messages in channel ${channel}`);
        }
      } catch (error) {
        logger.error(`Error checking channel ${channel}:`, error);
      }
    }
  }

  generateComment(): string {
    const comments = [
      "Интересный пост!",
      "Спасибо за информацию!",
      "Очень познавательно!",
      "Отличная статья!",
      "Продолжайте в том же духе!",
      "Это действительно полезно!",
      "Всегда рад вашим постам!",
      "Спасибо за ваш труд!",
      "Очень актуальная тема!",
      "Замечательный контент!"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  async start() {
    logger.info(`Starting monitoring with interval ${BOT_CONFIG.CHECK_INTERVAL}ms`);
    setInterval(() => this.monitorChannels(), BOT_CONFIG.CHECK_INTERVAL);
  }

  async close() {
    await this.userBot.close();
  }
}