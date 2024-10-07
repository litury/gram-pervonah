export interface ICommentService {
  processPost(channel: string, post: any): Promise<void>;
  generateComment(): string;
}