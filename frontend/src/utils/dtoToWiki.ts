import { WikiDto } from '~/models';

export const dtoToWiki = (dto: WikiDto) => {
  return {
    ...dto,
    pages: dto.pages.map((page) => {
      return {
        ...page,
        isVisible: 'isVisible' in page ? page.isVisible : true,
      };
    }),
  };
};
