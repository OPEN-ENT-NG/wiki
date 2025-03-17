import { PageDto } from '~/models';

export const dtoToPage = (dto: PageDto) => {
  return {
    ...dto,
    comments: dto.comments?.map((comment) => ({
      id: comment._id,
      comment: comment.comment,
      authorId: comment.author,
      authorName: comment.authorName,
      createdAt: comment.created.$date,
      ...(comment.modified?.$date && {
        updatedAt: comment.modified.$date,
      }),
      replyTo: comment.replyTo,
    })),
    isVisible: 'isVisible' in dto ? dto.isVisible : true,
  };
};
