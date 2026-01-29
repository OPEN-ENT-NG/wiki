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
  error?: any;
  views?: number;
  aiMetadata?: {
    contentGenerated?: boolean; // true if the AI generation is finished
    contentGeneratedDate?: Created;
  };
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

export type DuplicatePagePayload = Pick<
  Page,
  'title' | 'content' | 'isVisible' | 'position'
>;

export type DuplicatePageResult = {
  newPageIds: Array<{
    pageId: string;
    wikiId: string;
  }>;
};

export type DuplicatePageResultOrError =
  | DuplicatePageResult
  | {
      error: string;
    };

export type PickedPageId = Pick<Page, '_id' | 'error'>;
