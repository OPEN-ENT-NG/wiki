import { PageDto } from '~/models';

export const dtoToPage = (dto: PageDto) => {
  return {
    ...dto,
    comments: dto.comments?.map((comment) => ({
      id: comment._id,
      comment: comment.comment,
      authorId: comment.author,
      authorName: comment.authorName,
      createdAt: new Date(comment.created.$date)?.getTime(),
      updatedAt: new Date(comment.modified?.$date ?? '')?.getTime(),
      replyTo: comment.replyTo,
      deleted: comment.deleted,
    })),
    isVisible: 'isVisible' in dto ? dto.isVisible : true,
  };
};
