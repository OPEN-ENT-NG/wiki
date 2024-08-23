export interface PagePostPayload {
  title: string;
  content: string;
  isIndex?: boolean;
  parentId?: string;
  isVisible?: boolean;
}

export interface PagePutPayload {
  title: string;
  content: string;
  isIndex?: boolean;
  wasIndex?: boolean;
  isVisible?: boolean;
  parentId?: boolean;
}

export interface CommentPostPayload {
  comment: string;
}
