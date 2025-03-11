import { Created, Modified } from './date';

export interface CommentDto {
  _id: string;
  comment: string;
  author: string;
  authorName: string;
  created: Created;
  modified: Modified;
  replyTo?: string;
}

export interface Comment {
  id: string;
  comment: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt?: number;
  replyTo?: string;
}
