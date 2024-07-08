import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { PagePostPayload, PagePutPayload } from '~/models';
import { wikiService } from '../api';
import { wikiQueryOptions } from './wiki';

/**
 * Page Query Options Factory
 */
export const pageQueryOptions = {
  base: ['page'] as const,
  findOne: ({ wikiId, pageId }: { wikiId: string; pageId: string }) =>
    queryOptions({
      queryKey: [...pageQueryOptions.base, { id: pageId }] as const,
      queryFn: () => wikiService.getPage({ wikiId, pageId }),
      staleTime: 5000,
    }),
  revisions: ({ wikiId, pageId }: { wikiId: string; pageId: string }) =>
    queryOptions({
      queryKey: [...pageQueryOptions.base, 'revision', { id: pageId }] as const,
      queryFn: () => wikiService.getRevisionPage({ wikiId, pageId }),
      staleTime: 5000,
    }),
};

/**
 * All queries and mutations
 */

export const useGetPage = ({
  wikiId,
  pageId,
}: {
  wikiId: string;
  pageId: string;
}) => {
  return useQuery(pageQueryOptions.findOne({ wikiId, pageId }));
};

export const useGetRevisionPage = ({
  wikiId,
  pageId,
}: {
  wikiId: string;
  pageId: string;
}) => {
  return useQuery(pageQueryOptions.revisions({ wikiId, pageId }));
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wikiId, data }: { wikiId: string; data: PagePostPayload }) =>
      wikiService.createPage({ wikiId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAll().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAllWithPages().queryKey,
      });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      wikiId,
      pageId,
      data,
    }: {
      wikiId: string;
      pageId: string;
      data: PagePutPayload;
    }) => wikiService.updatePage({ wikiId, pageId, data }),
    onSuccess: (_data, { wikiId, pageId }) => {
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAll().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: pageQueryOptions.findOne({ wikiId, pageId }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAllWithPages().queryKey,
      });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wikiId, pageId }: { wikiId: string; pageId: string }) =>
      wikiService.deletePage({ wikiId, pageId }),
    onSuccess: (_data, { wikiId, pageId }) => {
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAll().queryKey,
      });
      queryClient.removeQueries({
        queryKey: pageQueryOptions.findOne({ wikiId, pageId }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAllWithPages().queryKey,
      });
    },
  });
};
