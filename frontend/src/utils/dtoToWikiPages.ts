import { WikiDto } from '~/models';
import { dtoToPage } from './dtoToPage';

export const dtoToWikiPage = (dto: WikiDto) => {
  const pages = [];
  pages.push(
    dto.pages.map((page) => {
      return dtoToPage(page);
    })
  );
  return pages[0];
};
