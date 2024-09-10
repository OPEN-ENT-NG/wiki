import { Page } from '~/models';

export const dtoToPage = (dto: Page) => {
  return {
    ...dto,
    comments: dto.comments?.map((comment) => ({
      id: comment._id,
      comment: comment.comment,
      authorId: comment.author,
      authorName: comment.authorName,
      createdAt: comment.created.$date,
    })),
  };
};
