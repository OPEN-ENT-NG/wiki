import { Modified } from './date';
import { Page } from './page';

export interface Wiki {
  _id: string;
  title: string;
  modified: Modified;
  owner: Owner;
  index?: string;
  shared?: string[];
  pages: Page[];
  thumbnail: string;
}

export type PickedWiki = Omit<Wiki, 'pages' | 'thumbnail'>;

export interface Owner {
  userId: string;
  displayName: string;
}

export type Shared = string[];
