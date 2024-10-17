import { Comment, CommentDto } from './comment';
import { Created, Modified } from './date';

export interface PageDto {
  _id: string;
  title: string;
  content: string;
  contentPlain: string;
  contentVersion: number;
  author: string;
  authorName: string;
  created?: Created;
  modified: Modified;
  isVisible: boolean;
  lastContributer?: string;
  lastContributerName?: string;
  comments?: CommentDto[];
  children?: [
    {
      _id: string;
      title: string;
      isVisible: boolean;
      position?: number;
    },
  ];
  parentId?: string;
  position?: number;
}

export interface Page {
  _id: string;
  title: string;
  content: string;
  contentPlain: string;
  contentVersion: number;
  author: string;
  authorName: string;
  modified: Modified;
  created?: Created;
  isVisible: boolean;
  lastContributer?: string;
  lastContributerName?: string;
  comments?: Comment[];
  children?: [
    {
      _id: string;
      title: string;
      isVisible: boolean;
      position?: number;
    },
  ];
  position?: number;
  parentId?: string;
}

export interface PageWithoutContent {
  _id: string;
  title: string;
  author: string;
  authorName: string;
  modified: Modified;
  created?: Created;
  isVisible: boolean;
  lastContributer?: string;
  lastContributerName?: string;
  comments?: Comment[];
  children?: [
    {
      _id: string;
      title: string;
      isVisible: boolean;
      position?: number;
    },
  ];
  parentId?: string;
  position?: number;
}
