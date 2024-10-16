import { UpdateTreeData } from 'node_modules/@edifice-ui/react/dist/components/Tree/types';

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
  pages: UpdateTreeData[];
}

export interface CommentPostPayload {
  comment: string;
}
