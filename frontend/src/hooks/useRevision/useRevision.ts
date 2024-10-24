import { useToast } from '@edifice-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from '~/models';
import { useGetPage, useGetRevisionPage, wikiService } from '~/services';
import { useSelectedPages, useUserRights } from '~/store';
import { useToastActions } from '~/store/toast';

export const useRevision = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const userRights = useUserRights();
  const { addToastMessage } = useToastActions();
  const selectedPages = useSelectedPages();
  const safePageId = params.pageId ?? selectedPages[0];
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // load page from route params
  const page = useGetPage({
    wikiId: params.wikiId!,
    pageId: safePageId!,
  });
  // load revision from route params
  const revision = useGetRevisionPage({
    wikiId: params.wikiId!,
    pageId: safePageId!,
    revisionId: params.versionId!,
  });

  const navigateToLatestRevision = () => {
    navigate(`/id/${params.wikiId}/page/${safePageId}`);
  };

  const restoreCurrentRevision = async () => {
    if (!revision.data || !page.data) {
      toast.error('wiki.version.notfound');
      return;
    }
    await restoreRevision({
      title: revision.data.title,
      content: revision.data.content,
      isVisible: page.data.isVisible,
    });
  };

  const restoreRevisionById = async (revisionId: string) => {
    const version = await wikiService.getRevisionPage({
      wikiId: params.wikiId!,
      pageId: safePageId!,
      revisionId,
    });
    await restoreRevision(version);
  };

  const restoreRevision = async ({
    content,
    isVisible,
    title,
  }: {
    title: string;
    content: string;
    isVisible: boolean;
  }) => {
    try {
      // disable restore button
      setIsRestoring(true);
      const data = await wikiService.updatePage({
        wikiId: params.wikiId!,
        pageId: safePageId!,
        data: { content, title, isVisible },
      });
      await queryClient.invalidateQueries();

      if (data.error) {
        addToastMessage({
          type: 'error',
          text: 'wiki.toast.error.restore.page',
        });
        return null;
      }

      addToastMessage({
        type: 'success',
        text: 'wiki.toast.success.restore.page',
      });

      return navigate(`/id/${params.wikiId}/page/${safePageId}`);
    } finally {
      setIsRestoring(false);
    }
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
    isRestoring,
    canRestore,
    getPageFromRoute,
    getRevisionFromRoute,
    getPageVersionFromRoute,
    navigateToLatestRevision,
    restoreCurrentRevision,
    restoreRevisionById,
    restoreRevision,
  };
};
