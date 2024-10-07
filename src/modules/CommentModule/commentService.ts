import { ICommentService } from './interfaces/ICommentService';
import { IUserBot } from '../UserBotModule/interfaces/IUserBot';
import { logger } from '../../utils/logger';
import { sleep } from '../../utils/helpers';
import { BOT_CONFIG } from '../../config/botConfig';

export class CommentService implements ICommentService {
  constructor(private userBot: IUserBot) {}

  async processPost(channel: string, post: any): Promise<void> {
    logger.info(`Processing post ${post.id} in channel ${channel}`);
    if (!post.groupedId) {
      logger.info(`Reacting to message ${post.id} in ${channel}`);
      await this.userBot.reactToPost(channel, post.id, '👍');
      
      const comment = this.generateComment();
      logger.info(`Attempting to comment on message ${post.id} in ${channel}`);
      const commentSuccess = await this.userBot.commentOnPost(channel, post.id, comment);

      if (commentSuccess) {
        logger.info(`Successfully commented on message ${post.id} in ${channel}`);
        await sleep(BOT_CONFIG.REACTION_TIMEOUT);
      } else {
        logger.warn(`Failed to comment on message ${post.id} in ${channel}.`);
      }
    } else {
      logger.info(`Skipping message ${post.id} in ${channel} as it's part of a media group`);
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
}