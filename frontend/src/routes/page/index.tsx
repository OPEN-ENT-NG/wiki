import { Editor, EditorRef } from '@edifice-ui/editor';
import {
  Alert,
  Button,
  checkUserRight,
  LoadingScreen,
  useOdeClient,
} from '@edifice-ui/react';
import { CommentProvider } from '@edifice-ui/react/comments';
import { QueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { MAX_COMMENT_LENGTH, MAX_COMMENTS } from '~/config';
import { DuplicateModal } from '~/features/page/DuplicateModal/DuplicateModal';
import { PageHeader } from '~/features/page/PageHeader/PageHeader';
import { RevisionHeader } from '~/features/page/RevisionHeader/RevisionHeader';
import { useRevision } from '~/hooks/useRevision/useRevision';
import { pageEditAction } from '~/routes/page/pageEditAction';
import {
  pageQueryOptions,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
  wikiQueryOptions,
  wikiService,
} from '~/services';
import {
  getUserRightsActions,
  useOpenConfirmVisibilityModal,
  useOpenDeleteModal,
  useOpenDuplicateModal,
  useOpenRevisionModal,
  useTreeActions,
  useUserRights,
} from '~/store';
import { getToastActions } from '~/store/toast';

const DeletePageModal = lazy(
  async () => await import('~/features/page/DeletePageModal/DeletePageModal'),
);

const RevisionModal = lazy(
  async () => await import('~/features/page/RevisionModal/RevisionModal'),
);

const ConfirmVisibilityModal = lazy(
  async () =>
    await import(
      '~/features/page/ConfirmVisibilityModal/ConfirmVisibilityModal'
    ),
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

    return redirect(`/id/${params.wikiId}`);
  };

export const visibleAction = pageEditAction;

export const Page = () => {
  const params = useParams();
  const editorRef = useRef<EditorRef>(null);
  const openDeleteModal = useOpenDeleteModal();
  const openVersionsModal = useOpenRevisionModal();
  const openDuplicateModal = useOpenDuplicateModal();
  const openConfirmVisibilityModal = useOpenConfirmVisibilityModal();
  const navigate = useNavigate();
  const userRights = useUserRights();
  const canComment = userRights.comment;

  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);
  const { setSelectedNodeId } = useTreeActions();
  const { getPageVersionFromRoute } = useRevision();
  const { isPending, error, data, showComments, isRevision } =
    getPageVersionFromRoute();

  useEffect(() => {
    if (data) {
      setSelectedNodeId(data._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const updateComment = useUpdateComment();

  const handleOnPostComment = async (comment: string) => {
    await createComment.mutate({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      comment,
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

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return data ? (
    <div className="d-flex flex-column mt-24 ms-md-24 me-md-16">
      {isRevision ? (
        <RevisionHeader page={data} />
      ) : (
        <PageHeader page={data} wikiId={params.wikiId} />
      )}
      {data.contentVersion === 0 ? (
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
      <Editor
        ref={editorRef}
        content={data.content}
        mode="read"
        variant="ghost"
        visibility="protected"
      />

      {showComments && (
        <CommentProvider
          comments={data.comments}
          options={{
            maxCommentLength: MAX_COMMENT_LENGTH,
            maxComments: MAX_COMMENTS,
          }}
          type={canComment ? 'edit' : 'read'}
          callbacks={{
            post: (comment) => handleOnPostComment(comment),
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
        {openConfirmVisibilityModal && <ConfirmVisibilityModal page={data} />}
      </Suspense>
    </div>
  ) : null;
};
