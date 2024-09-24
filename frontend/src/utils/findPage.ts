import { Wiki } from '~/models';

export const findPage = (wiki: Wiki, pageId: string) => {
  return wiki.pages?.find((page) => page._id === pageId);
};
