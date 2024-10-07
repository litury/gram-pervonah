import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import { API_CONFIG } from '../../config/botConfig';
import { logger } from '../../utils/logger';
import { sleep } from '../../utils/helpers';

export class UserBot {
  public client: TelegramClient;

  constructor(sessionString: string) {
    if (!API_CONFIG.API_ID || !API_CONFIG.API_HASH) {
      throw new Error('API_ID or API_HASH is not set in .env file');
    }
    this.client = new TelegramClient(
      new StringSession(sessionString),
      Number(API_CONFIG.API_ID),
      API_CONFIG.API_HASH,
      { connectionRetries: 5 }
    );
  }

  async init() {
    await this.client.start({
      phoneNumber: async () => "",
      password: async () => "",
      phoneCode: async () => "",
      onError: (err) => logger.error('Client error:', err),
    });
    logger.info('UserBot initialized');
  }

  async getMessages(channel: string, limit: number) {
    logger.info(`Fetching ${limit} messages from ${channel}`);
    return this.client.getMessages(channel, { limit });
  }

  async reactToPost(channelId: string, messageId: number, reaction: string) {
    try {
      await this.client.invoke(new Api.messages.SendReaction({
        peer: channelId,
        msgId: messageId,
        reaction: [new Api.ReactionEmoji({
          emoticon: reaction
        })],
      }));
      logger.info(`Reacted to post ${messageId} in ${channelId} with ${reaction}`);
    } catch (error: any) {
      if (error.errorMessage === 'FLOOD') {
        const waitSeconds = error.seconds || 60;
        logger.warn(`Slow mode is active. Waiting for ${waitSeconds} seconds before next reaction.`);
        await sleep(waitSeconds * 1000);
      } else {
        logger.error(`Error reacting to post ${messageId} in ${channelId}:`, error);
      }
    }
  }

  async commentOnPost(channelId: string, messageId: number, comment: string): Promise<boolean> {
    try {
      const result = await this.client.invoke(new Api.messages.GetDiscussionMessage({
        peer: channelId,
        msgId: messageId,
      }));

      logger.info(`GetDiscussionMessage result for ${channelId}, message ${messageId}:`, JSON.stringify(result, null, 2));

      if (result.messages && result.messages.length > 0) {
        const discussionMessage = result.messages[0];
        const peer = discussionMessage.peerId || channelId;
        await this.client.sendMessage(peer, {
          message: comment,
          replyTo: discussionMessage.id,
        });
        logger.info(`Commented on post ${messageId} in ${channelId}`);
        return true;
      } else {
        logger.warn(`No discussion found for post ${messageId} in ${channelId}`);
        return false;
      }
    } catch (error: any) {
      if (error.errorMessage === 'FLOOD') {
        const waitSeconds = error.seconds || 60;
        logger.warn(`Slow mode is active. Waiting for ${waitSeconds} seconds before next comment.`);
        await sleep(waitSeconds * 1000);
      } else if (error.errorMessage === 'MSG_ID_INVALID') {
        logger.warn(`Invalid message ID ${messageId} for channel ${channelId}. Skipping comment.`);
      } else {
        logger.error(`Error commenting on post ${messageId} in ${channelId}:`, error);
      }
      return false;
    }
  }

  async joinChannel(channelId: string) {
    try {
      await this.client.invoke(new Api.channels.JoinChannel({
        channel: channelId
      }));
      logger.info(`Joined channel ${channelId}`);
    } catch (error) {
      logger.error(`Error joining channel ${channelId}:`, error);
    }
  }

  async isChannelMember(channelId: string): Promise<boolean> {
    try {
      const result = await this.client.invoke(new Api.channels.GetParticipant({
        channel: channelId,
        participant: 'me'
      }));
      return true;
    } catch (error: any) {
      if (error.message && error.message.includes('USER_NOT_PARTICIPANT')) {
        return false;
      }
      logger.error(`Error checking channel membership for ${channelId}:`, error);
      return false;
    }
  }

  async close() {
    await this.client.disconnect();
    logger.info('UserBot disconnected');
  }
}