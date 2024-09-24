import { useToast } from '@edifice-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from '~/models';
import {
  pageQueryOptions,
  useGetPage,
  useGetRevisionPage,
  wikiQueryOptions,
  wikiService,
} from '~/services';
import { useUserRights } from '~/store';

export const useRevision = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const userRights = useUserRights();
  // load page from route params
  const page = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });
  // load revision from route params
  const revision = useGetRevisionPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
    revisionId: params.versionId!,
  });

  const navigateToLatestRevision = () => {
    navigate(`/id/${params.wikiId}/page/${params.pageId}`);
  };

  const restoreCurrentRevision = async () => {
    if (!revision.data || !page.data) {
      toast.error('wiki.version.notfound');
      return;
    }
    await wikiService.updatePage({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      data: {
        title: revision.data.title,
        content: revision.data.content,
        isVisible: page.data.isVisible,
      },
    });

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });
    await queryClient.invalidateQueries({ queryKey: pageQueryOptions.base });

    return navigate(`/id/${params.wikiId}/page/${params.pageId!}`);
  };

  const getPageVersionFromRoute = () => {
    const showComments = !params.versionId;
    const isRevision = !!params.versionId;
    return {
      isRevision,
      showComments,
      data: {
        ...page.data,
        content: revision.data?.content ?? page.data?.content,
        lastContributer: revision.data?.userId ?? page.data?.lastContributer,
        lastContributerName:
          revision.data?.username ?? page.data?.lastContributerName,
        title: revision.data?.title ?? page.data?.title,
        modified: revision.data?.date ?? page.data?.modified,
      } as Page,
      isPending: page.isPending || (params.versionId && revision.isPending),
      isError: page.isError || revision.isError,
      error: page.error || revision.error,
    };
  };

  const getPageFromRoute = () => {
    return page;
  };

  const getRevisionFromRoute = () => {
    return revision;
  };

  const canRestore = () => {
    return userRights.contrib || userRights.creator || userRights.manager;
  };

  return {
    canRestore,
    getPageFromRoute,
    getRevisionFromRoute,
    getPageVersionFromRoute,
    navigateToLatestRevision,
    restoreCurrentRevision,
  };
};
