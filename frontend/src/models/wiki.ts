import { Created, Modified } from './date';
import { Page, PageDto } from './page';

export interface WikiDto {
  _id: string;
  title: string;
  pages: Page[];
  thumbnail: string;
  created: Created;
  modified: Modified;
  owner: Owner;
  rights: string[];
  index?: string;
  shared?: string[];
}

export interface WikiPagesDto {
  pages: PageDto[];
}

export interface Wiki {
  _id: string;
  title: string;
  modified: Modified;
  owner: Owner;
  index?: string;
  shared?: string[];
  rights: string[];
  pages: Page[];
  thumbnail: string;
}

export type PickedWiki = Omit<Wiki, 'pages' | 'thumbnail'>;

export interface Owner {
  userId: string;
  displayName: string;
}

export type Shared = string[];
