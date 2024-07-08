import { Created } from './date';

export interface Comment {
  _id: string;
  comment: string;
  author: string;
  authorName: string;
  created: Created;
}
