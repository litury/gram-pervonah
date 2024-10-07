import { EventEmitter } from 'events';
import { IChannelMonitor } from './interfaces/IChannelMonitor';
import { IUserBot } from '../UserBotModule/interfaces/IUserBot';
import { CHANNELS } from '../../config/channelList';
import { logger } from '../../utils/logger';

export class ChannelMonitorService extends EventEmitter implements IChannelMonitor {
  private lastProcessedMessageIds: Map<string, number> = new Map();

  constructor(private userBot: IUserBot) {
    super();
  }

  startMonitoring(interval: number): void {
    logger.info(`Starting monitoring with interval ${interval}ms`);
    setInterval(() => this.monitorChannels(), interval);
  }

  async processLastPosts(): Promise<void> {
    for (const channel of CHANNELS) {
      try {
        const messages = await this.userBot.getMessages(channel, 5);
        logger.info(`Fetched ${messages.length} messages from ${channel}`);
        if (messages.length > 0) {
          this.lastProcessedMessageIds.set(channel, messages[0].id);
          for (const message of messages) {
            logger.info(`Emitting newPost event for message ${message.id} in ${channel}`);
            this.emit('newPost', channel, message);
          }
        } else {
          logger.info(`No messages found in ${channel}`);
        }
      } catch (error) {
        logger.error(`Error processing last posts in ${channel}:`, error);
      }
    }
  }

  async monitorChannels(): Promise<void> {
    logger.info('Starting channel monitoring');
    for (const channel of CHANNELS) {
      try {
        const lastProcessedId = this.lastProcessedMessageIds.get(channel) || 0;
        const messages = await this.userBot.getMessages(channel, 5);
        logger.info(`Fetched ${messages.length} messages from ${channel}`);
        
        const newMessages = messages.filter(msg => msg.id > lastProcessedId);
        if (newMessages.length > 0) {
          logger.info(`Found ${newMessages.length} new messages in ${channel}`);
          this.lastProcessedMessageIds.set(channel, newMessages[0].id);
          for (const message of newMessages) {
            logger.info(`Emitting newPost event for message ${message.id} in ${channel}`);
            this.emit('newPost', channel, message);
          }
        } else {
          logger.info(`No new messages in channel ${channel}`);
        }
      } catch (error) {
        logger.error(`Error checking channel ${channel}:`, error);
      }
    }
  }
}