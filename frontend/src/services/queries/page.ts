import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { wikiService } from '../api';
import { wikiQueryOptions } from './wiki';

/**
 * Page Query Options Factory
 */
export const pageQueryOptions = {
  all: ['page'] as const,
  one: (wikiId: string, pageId: string) =>
    queryOptions({
      queryKey: [...pageQueryOptions.all, { id: pageId }] as const,
      queryFn: () => wikiService.getPage(wikiId, pageId),
      staleTime: 5000,
    }),
  revision: (wikiId: string, pageId: string) =>
    queryOptions({
      queryKey: [...pageQueryOptions.all, 'revision', { id: pageId }] as const,
      queryFn: () => wikiService.getRevisionPage(wikiId, pageId),
      staleTime: 5000,
    }),
};

/**
 * All queries and mutations
 */

export const useGetPage = (wikiId: string, pageId: string) => {
  return useQuery(pageQueryOptions.one(wikiId, pageId));
};

export const useGetRevisionPage = (wikiId: string, pageId: string) => {
  return useQuery(pageQueryOptions.revision(wikiId, pageId));
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wikiId: string) => wikiService.createPage(wikiId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.listall().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.listallpages().queryKey,
      });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wikiId, pageId }: { wikiId: string; pageId: string }) =>
      wikiService.updatePage(wikiId, pageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.listall().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: pageQueryOptions.one(variables.wikiId, variables.pageId)
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.listallpages().queryKey,
      });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wikiId, pageId }: { wikiId: string; pageId: string }) =>
      wikiService.deletePage(wikiId, pageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.listall().queryKey,
      });
      queryClient.removeQueries({
        queryKey: pageQueryOptions.one(variables.wikiId, variables.pageId)
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.listallpages().queryKey,
      });
    },
  });
};
