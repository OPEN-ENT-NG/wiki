import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  DuplicatePagePayload,
  PagePostPayload,
  PagePutPayload,
} from '~/models';
import { wikiQueryOptions, wikiService } from '~/services';

/**
 * Page Query Options Factory
 */
export const pageQueryOptions = {
  base: ['page'] as const,
  findOne: ({
    wikiId,
    pageId,
    originalformat,
  }: {
    wikiId: string;
    pageId: string;
    originalformat?: boolean;
  }) =>
    queryOptions({
      enabled: !!pageId,
      queryKey: [
        ...pageQueryOptions.base,
        { id: pageId },
        { originalformat },
      ] as const,
      queryFn: () => wikiService.getPage({ wikiId, pageId, originalformat }),
      staleTime: 5000,
    }),
  findAllFromWiki: ({
    wikiId,
    content,
  }: {
    wikiId: string;
    content: boolean;
  }) =>
    queryOptions({
      queryKey: [...pageQueryOptions.base, { id: wikiId }] as const,
      queryFn: () => wikiService.getWikiPages(wikiId, content),
      staleTime: 5000,
    }),
  findAllRevisionsForPage: ({
    wikiId,
    pageId,
  }: {
    wikiId: string;
    pageId: string;
  }) =>
    queryOptions({
      queryKey: [...pageQueryOptions.base, 'revision', { id: pageId }] as const,
      queryFn: () => wikiService.getRevisionsPage({ wikiId, pageId }),
      staleTime: 5000,
    }),
  findOneRevision: ({
    wikiId,
    pageId,
    revisionId,
  }: {
    wikiId: string;
    pageId: string;
    revisionId?: string;
  }) =>
    queryOptions({
      enabled: !!revisionId,
      queryKey: [
        ...pageQueryOptions.base,
        'revision',
        { id: pageId },
        { id: revisionId },
      ] as const,
      queryFn: async () => {
        const response = await wikiService.getRevisionPage({
          wikiId,
          pageId,
          revisionId: revisionId!,
        });
        return response;
      },
      staleTime: 5000,
    }),
};

/**
 * All queries and mutations
 */

export const useGetPage = ({
  wikiId,
  pageId,
  originalformat,
}: {
  wikiId: string;
  pageId: string;
  originalformat?: boolean;
}) => {
  return useQuery(pageQueryOptions.findOne({ wikiId, pageId, originalformat }));
};

export const useGetPagesFromWiki = ({
  wikiId,
  content,
  force,
}: {
  wikiId: string;
  content: boolean;
  force?: boolean;
}) => {
  const queryClient = useQueryClient();
  if (force) {
    queryClient.invalidateQueries({
      queryKey: pageQueryOptions.findAllFromWiki({ wikiId, content }).queryKey,
    });
  }
  return useQuery(pageQueryOptions.findAllFromWiki({ wikiId, content }));
};

export const useGetRevisionsPage = ({
  wikiId,
  pageId,
}: {
  wikiId: string;
  pageId: string;
}) => {
  return useQuery(pageQueryOptions.findAllRevisionsForPage({ wikiId, pageId }));
};

export const useGetRevisionPage = ({
  wikiId,
  pageId,
  revisionId,
}: {
  wikiId: string;
  pageId: string;
  revisionId?: string;
}) => {
  return useQuery(
    pageQueryOptions.findOneRevision({ wikiId, pageId, revisionId }),
  );
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
        queryKey: wikiQueryOptions.findAllAsResources().queryKey,
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
        queryKey: wikiQueryOptions.findAllAsResources().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAllWithPages().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: pageQueryOptions.findOne({ wikiId, pageId }).queryKey,
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
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAllAsResources().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAllWithPages().queryKey,
      });
      queryClient.removeQueries({
        queryKey: pageQueryOptions.findOne({ wikiId, pageId }).queryKey,
      });
    },
  });
};
/**
 * Duplicate page mutation
 * On success, invalidate the following queries:
 */
export const useDuplicatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      destinationWikiId,
      data,
    }: {
      destinationWikiId: string;
      data: DuplicatePagePayload;
    }) => wikiService.duplicatePage({ destinationWikiId, data }),
    onSuccess: (_data, { destinationWikiId }) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryOptions.findAllFromWiki({
          wikiId: destinationWikiId,
          content: true,
        }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findAllWithPages().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: wikiQueryOptions.findOne(destinationWikiId).queryKey,
      });
    },
  });
};
