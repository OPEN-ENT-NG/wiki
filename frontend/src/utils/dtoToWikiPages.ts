import { WikiDto } from '~/models';
import { dtoToPage } from './dtoToPage';

export const dtoToWikiPage = (dto: WikiDto) => {
  const pages = dto.pages.map((page) => dtoToPage(page));
  return pages;
};
