import { CommentCreated, CommentModified } from './date';

export interface CommentDto {
  _id: string;
  comment: string;
  author: string;
  authorName: string;
  created: CommentCreated;
  modified: CommentModified;
  replyTo?: string;
  deleted?: boolean;
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
