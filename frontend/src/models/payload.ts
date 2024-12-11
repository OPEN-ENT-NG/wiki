import { UpdateTreeData } from '@edifice.io/react';

export type UpdateTreeDataWithVisibility = UpdateTreeData & {
  isVisible?: boolean;
  isIndex?: boolean;
};

export interface PagePostPayload {
  title: string;
  content: string;
  isIndex?: boolean;
  parentId?: string;
  isVisible?: boolean;
  position?: number;
}

export interface PagePutPayload {
  title: string;
  content: string;
  isIndex?: boolean;
  wasIndex?: boolean;
  isVisible?: boolean;
  parentId?: string;
  position?: number;
}

export interface PagesPutPayload {
  pages: UpdateTreeDataWithVisibility[];
}

export interface CommentPostPayload {
  comment: string;
}
