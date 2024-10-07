import { EventEmitter } from 'events';

export interface IChannelMonitor extends EventEmitter {
  startMonitoring(interval: number): void;
  processLastPosts(): Promise<void>;
  monitorChannels(): Promise<void>;
}