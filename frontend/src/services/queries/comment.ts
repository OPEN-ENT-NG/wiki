/**
 * All queries and mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastActions } from '~/store/toast';
import { pageQueryOptions, wikiService } from '..';

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { addToastMessage } = useToastActions();

  return useMutation({
    mutationFn: ({
      wikiId,
      pageId,
      comment,
      replyTo,
    }: {
      wikiId: string;
      pageId: string;
      comment: string;
      replyTo?: string;
    }) => wikiService.createComment({ wikiId, pageId, comment, replyTo }),
    onSuccess: (_data, { wikiId, pageId }) => {
      addToastMessage({
        type: 'success',
        text: 'wiki.toast.success.create.comment',
      });

      queryClient.invalidateQueries({
        queryKey: pageQueryOptions.findOne({ wikiId, pageId }).queryKey,
      });
    },
    onError: () => {
      addToastMessage({
        type: 'error',
        text: 'wiki.toast.error.create.comment',
      });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  const { addToastMessage } = useToastActions();

  return useMutation({
    mutationFn: ({
      wikiId,
      pageId,
      commentId,
      comment,
    }: {
      wikiId: string;
      pageId: string;
      commentId: string;
      comment: string;
    }) => wikiService.updateComment({ wikiId, pageId, commentId, comment }),

    onSuccess: (_data, { wikiId, pageId }) => {
      addToastMessage({
        type: 'success',
        text: 'wiki.toast.success.edit.comment',
      });

      queryClient.invalidateQueries({
        queryKey: pageQueryOptions.findOne({ wikiId, pageId }).queryKey,
      });
    },
    onError: () => {
      addToastMessage({
        type: 'error',
        text: 'wiki.toast.error.edit.comment',
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { addToastMessage } = useToastActions();

  return useMutation({
    mutationFn: ({
      wikiId,
      pageId,
      commentId,
    }: {
      wikiId: string;
      pageId: string;
      commentId: string;
    }) => wikiService.deleteComment({ wikiId, pageId, commentId }),
    onSuccess: (_data, { wikiId, pageId }) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryOptions.findOne({ wikiId, pageId }).queryKey,
      });

      addToastMessage({
        type: 'success',
        text: 'wiki.toast.success.delete.comment',
      });
    },
    onError: () => {
      addToastMessage({
        type: 'error',
        text: 'wiki.toast.error.delete.comment',
      });
    },
  });
};
