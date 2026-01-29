import { TreeItem } from '@edifice.io/react';
import { Created, Modified } from './date';
import { Page, PageDto } from './page';

export interface AIMetadata {
  level: string;
  subject: string;
  sequence: string;
  keywords: string;
  generationDate: {
    $date: string;
  };
  contentGenerated: boolean;
  contentGeneratedDate: {
    $date: string;
  };
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
    model: string;
    version: string;
    status: string;
  };
  structureGenerated: boolean;
  structureGeneratedDate: {
    $date: string;
  };
}

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
  aiGenerated?: boolean;
  aiMetadata?: AIMetadata;
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

export interface WikiTreeItem extends TreeItem {
  aiMetadata?: {
    contentGenerated?: boolean;
    contentGeneratedDate?: Created;
  };
}
