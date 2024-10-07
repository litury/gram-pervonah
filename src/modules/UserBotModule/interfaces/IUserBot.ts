import { TelegramClient } from 'telegram';

export interface IUserBot {
  client: TelegramClient;
  init(): Promise<void>;
  getMessages(channel: string, limit: number): Promise<any[]>;
  reactToPost(channelId: string, messageId: number, reaction: string): Promise<void>;
  commentOnPost(channelId: string, messageId: number, comment: string): Promise<boolean>;
  joinChannel(channelId: string): Promise<void>;
  isChannelMember(channelId: string): Promise<boolean>;
  close(): Promise<void>;
}