export interface PagePostPayload {
  title: string;
  content: string;
}

export interface PagePutPayload {
  title: string;
  content: string;
  isIndex: boolean;
  wasIndex: boolean;
}

export interface CommentPostPayload {
  comment: string;
}
