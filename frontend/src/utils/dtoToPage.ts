import { PageDto } from '~/models';

export const dtoToPage = (dto: PageDto) => {
  const { _id, ...rest } = dto;

  return {
    id: _id,
    ...rest,
    comments: rest.comments?.map((comment) => ({
      id: comment._id,
      comment: comment.comment,
      authorId: comment.author,
      authorName: comment.authorName,
      createdAt: comment.created.$date,
      ...(comment.modified?.$date && {
        updatedAt: comment.modified.$date,
      }),
    })),
  };
};
