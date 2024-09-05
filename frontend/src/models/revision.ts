import { Created } from './date';

export interface Revision {
  _id: string;
  wikiId: string;
  pageId: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  isVisible: boolean;
  date: Created;
}
