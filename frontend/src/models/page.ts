import { Modified } from './date';

export interface Page {
  _id: string;
  title: string;
  content: string;
  contentPlain: string;
  author: string;
  authorName: string;
  modified: Modified;
  lastContributer?: string;
  lastContributerName?: string;
  comments?: Comment[];
  children?: [
    {
      _id: string;
      title: string;
    }
  ];
  parentId?: string;
}
