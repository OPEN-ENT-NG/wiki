import {
  Alert,
  Button,
  checkUserRight,
  Flex,
  LoadingScreen,
  useEdificeClient,
} from '@edifice.io/react';
import { ViewsCounter, ViewsModal } from '@edifice.io/react/audience';
import { CommentProvider } from '@edifice.io/react/comments';
import { Editor, EditorRef } from '@edifice.io/react/editor';
import { QueryClient } from '@tanstack/react-query';
import Lottie from 'lottie-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ADDITIONAL_COMMENTS,
  ADDITIONAL_REPLIES,
  MAX_COMMENT_LENGTH,
  MAX_COMMENTS,
  MAX_REPLIES,
  MAX_REPLY_LENGTH,
} from '~/config';
import { DuplicateModal } from '~/features/page/DuplicateModal/DuplicateModal';
import { MoveModal } from '~/features/page/MoveModal/MoveModal';
import { PageHeader } from '~/features/page/PageHeader/PageHeader';
import { RevisionHeader } from '~/features/page/RevisionHeader/RevisionHeader';
import { useRevision } from '~/hooks/useRevision/useRevision';
import { pageEditAction } from '~/routes/page/pageEditAction';
import {
  pageQueryOptions,
  useCreateComment,
  useDeleteComment,
  useGetPageViewsDetails,
  useUpdateComment,
  wikiQueryOptions,
  wikiService,
} from '~/services';
import {
  getUserRightsActions,
  useOpenConfirmVisibilityModal,
  useOpenDeleteModal,
  useOpenDuplicateModal,
  useOpenMoveModal,
  useOpenRevisionModal,
  useTreeActions,
  useUserRights,
} from '~/store';
import { getToastActions } from '~/store/toast';
import { findLastPage } from '~/utils/findLastPage';
import loadingAnimation from '../../features/wiki/PagesAssistant/animations/loading.json';

const DeletePageModal = lazy(
  async () => await import('~/features/page/DeletePageModal/DeletePageModal'),
);

const RevisionModal = lazy(
  async () => await import('~/features/page/RevisionModal/RevisionModal'),
);

const ConfirmVisibilityModal = lazy(
  async () =>
    await import('~/features/page/ConfirmVisibilityModal/ConfirmVisibilityModal'),
);

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const pageData = await queryClient.ensureQueryData(
      pageQueryOptions.findOne({
        wikiId: params.wikiId!,
        pageId: params.pageId!,
      }),
    );

    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!),
    );
    const userRights = await checkUserRight(data.rights, 'comment');
    const { setUserRights } = getUserRightsActions();
    setUserRights(userRights);

    if (!userRights.manager && !pageData.isVisible) {
      throw new Response('', { status: 401 });
    }

    if (params.versionId) {
      await queryClient.ensureQueryData(
        pageQueryOptions.findOneRevision({
          wikiId: params.wikiId!,
          pageId: params.pageId!,
          revisionId: params.versionId!,
        }),
      );
    }

    return pageData;
  };

export const action =
  (queryClient: QueryClient) =>
  async ({ params }: ActionFunctionArgs) => {
    const { addToastMessage } = getToastActions();
    const pageParams = {
      wikiId: params.wikiId!,
      pageId: params.pageId!,
    };

    // get wiki to check if it has pages
    const wiki = await queryClient.fetchQuery(
      wikiQueryOptions.findOne(params.wikiId!),
    );

    const wikiOptions = wikiQueryOptions.findOne(params.wikiId!);

    const data = await wikiService.deletePage(pageParams);
    await queryClient.invalidateQueries(wikiOptions);

    if (data.error) {
      addToastMessage({
        type: 'error',
        text: 'wiki.toast.error.delete.page',
      });
      return null;
    }

    addToastMessage({
      type: 'success',
      text: 'wiki.toast.success.delete.page',
    });
    // get last page to redirect to it
    const lastPage = wiki
      ? findLastPage(wiki, { beforePageId: params.pageId })
      : undefined;
    // redirect to last page if it exists, otherwise redirect to pages assistant
    return lastPage
      ? redirect(`/id/${params.wikiId}/page/${lastPage._id}`)
      : redirect(`/id/${params.wikiId}/pages/assistant`);
  };

export const visibleAction = pageEditAction;

export const Page = () => {
  const [isViewsModalOpen, setIsViewsModalOpen] = useState<boolean>(false);
  const params = useParams();
  const editorRef = useRef<EditorRef>(null);
  const openDeleteModal = useOpenDeleteModal();
  const openVersionsModal = useOpenRevisionModal();
  const openDuplicateModal = useOpenDuplicateModal();
  const openMoveModal = useOpenMoveModal();
  const openConfirmVisibilityModal = useOpenConfirmVisibilityModal();
  const navigate = useNavigate();
  const userRights = useUserRights();
  const canComment = userRights.comment;
  const canSeeViewsCounter = userRights.manager || userRights.creator;

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);
  const { setSelectedNodeId } = useTreeActions();
  const { getPageVersionFromRoute, getPageFromRoute } = useRevision();
  const { isPending, error, data, showComments, isRevision } =
    getPageVersionFromRoute();
  const { refetch: refetchPage } = getPageFromRoute();

  const { data: pageViewsDetails } = useGetPageViewsDetails({
    pageId: params.pageId || '',
  });

  useEffect(() => {
    wikiService.triggerPageView(params.pageId!);
  }, [params.pageId]);

  useEffect(() => {
    if (data) {
      setSelectedNodeId(data._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /** Polling to check if AI content generation is finished */
  useEffect(() => {
    // Only poll if page has AI metadata and content is not yet generated
    if (data?.aiMetadata && !data.aiMetadata.contentGenerated) {
      const interval = setInterval(() => {
        refetchPage();
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [data?.aiMetadata, refetchPage]);

  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const updateComment = useUpdateComment();

  const handleOnPostComment = async (comment: string, replyTo?: string) => {
    await createComment.mutate({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      comment,
      replyTo,
    });
  };

  const handleOnPutcomment = async ({
    comment,
    commentId,
  }: {
    comment: string;
    commentId: string;
  }) => {
    await updateComment.mutateAsync({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      commentId,
      comment,
    });
  };

  const handleOnDeleteComment = async (commentId: string) => {
    await deleteComment.mutateAsync({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      commentId,
    });
  };

  const handleViewsCounterClick = async () => {
    setIsViewsModalOpen(true);
  };

  const handleViewsModalClose = () => {
    setIsViewsModalOpen(false);
  };

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return data ? (
    <div className="d-flex flex-column mt-24 ms-md-24 me-md-16">
      {isRevision ? (
        <RevisionHeader page={data} />
      ) : (
        <PageHeader page={data} wikiId={params.wikiId} />
      )}
      {!data.aiMetadata && data.contentVersion === 0 ? (
        <Alert
          type="warning"
          className="my-24"
          button={
            <Button
              color="tertiary"
              type="button"
              variant="ghost"
              className="text-gray-700"
              onClick={() => {
                navigate(
                  `/id/${params.wikiId}/page/${params.pageId}/oldformat`,
                );
              }}
            >
              {t('wiki.oldFormat.open')}
            </Button>
          }
        >
          {t('wiki.oldFormat.text')}
        </Alert>
      ) : null}
      {data.aiMetadata && !data.aiMetadata.contentGenerated && (
        <div className="m-auto">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: 250 }}
          />
          <div
            className="small"
            style={{ color: '#909090', fontStyle: 'italic' }}
          >
            {t('wiki.assistant.ai.step4.structure.result.wait.info', {
              ns: appCode,
            })}
          </div>
        </div>
      )}
      <Editor
        ref={editorRef}
        content={data.content}
        mode="read"
        variant="ghost"
        visibility="protected"
        focus={null}
      />
      <Flex justify="end">
        {canSeeViewsCounter && (
          <ViewsCounter
            viewsCounter={pageViewsDetails?.viewsCounter || 0}
            onClick={() => handleViewsCounterClick()}
          />
        )}
      </Flex>
      {showComments && (
        <CommentProvider
          comments={data.comments}
          options={{
            maxCommentLength: MAX_COMMENT_LENGTH,
            maxReplyLength: MAX_REPLY_LENGTH,
            maxComments: MAX_COMMENTS,
            additionalComments: ADDITIONAL_COMMENTS,
            maxReplies: MAX_REPLIES,
            additionalReplies: ADDITIONAL_REPLIES,
          }}
          type={canComment ? 'edit' : 'read'}
          rights={userRights}
          callbacks={{
            post: (comment: string, replyTo?: string) =>
              handleOnPostComment(comment, replyTo),
            put: ({ comment, commentId }) =>
              handleOnPutcomment({ comment, commentId }),
            delete: (commentId) => handleOnDeleteComment(commentId),
          }}
        />
      )}
      <Suspense fallback={<LoadingScreen position={false} />}>
        {openDeleteModal && <DeletePageModal />}
        {openVersionsModal && <RevisionModal pageId={params.pageId!} />}
        {openDuplicateModal && (
          <DuplicateModal pageId={params.pageId!} wikiId={params.wikiId!} />
        )}
        {openMoveModal && (
          <MoveModal wikiId={params.wikiId!} pageId={params.pageId!} />
        )}
        {openConfirmVisibilityModal && <ConfirmVisibilityModal page={data} />}

        {isViewsModalOpen && pageViewsDetails && (
          <ViewsModal
            viewsDetails={pageViewsDetails}
            isOpen={isViewsModalOpen}
            onModalClose={handleViewsModalClose}
          />
        )}
      </Suspense>
    </div>
  ) : null;
};
