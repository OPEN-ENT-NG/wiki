import { WikiPagesDto } from '~/models';
import { dtoToPage } from './dtoToPage';

export const dtoToWikiPages = (dto: WikiPagesDto) => {
  const pages = dto.pages.map((page) => dtoToPage(page));
  return pages;
};
