import { RightRole } from 'edifice-ts-client';
import { Modified } from './date';
import { Page } from './page';

export interface Wiki {
  _id: string;
  title: string;
  pages: Page[];
  thumbnail?: string;
  modified: Modified;
  owner: Owner;
  shared?: Shared[];
  rights: RightRole[];
  index?: string;
}

export interface Owner {
  userId: string;
  displayName: string;
}

export type Shared = string[];
