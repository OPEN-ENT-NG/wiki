/**
 * All queries and mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wikiService } from '..';
import { pageQueryOptions } from './page';

/**
 *
 * NOT IMPLEMENTED YET
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wikiId, pageId }: { wikiId: string; pageId: string }) =>
      wikiService.createComment({ wikiId, pageId }),
    onSuccess: (_data, { wikiId, pageId }) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryOptions.findOne({ wikiId, pageId }).queryKey,
      });
    },
  });
};

/**
 *
 * NOT IMPLEMENTED YET
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      wikiId,
      pageId,
      commentId,
    }: {
      wikiId: string;
      pageId: string;
      commentId: string;
    }) => wikiService.updateComment({ wikiId, pageId, commentId }),
    onSuccess: (_data, { wikiId, pageId }) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryOptions.findOne({ wikiId, pageId }).queryKey,
      });
    },
  });
};

/**
 *
 * NOT IMPLEMENTED YET
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
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
    },
  });
};
