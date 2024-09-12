import { Editor, EditorRef } from '@edifice-ui/editor';
import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import { lazy, Suspense, useEffect, useRef } from 'react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useParams,
} from 'react-router-dom';
import { MAX_COMMENT_LENGTH, MAX_COMMENTS } from '~/config';
import Comments from '~/features/comments/Comments';
import { PageHeader } from '~/features/page/PageHeader/PageHeader';
import {
  pageQueryOptions,
  useCreateComment,
  useDeleteComment,
  useGetPage,
  useUpdateComment,
  wikiService,
} from '~/services';
import {
  useOpenDeleteModal,
  useOpenRevisionModal,
  useTreeActions,
} from '~/store';

const DeleteModal = lazy(
  async () => await import('~/features/page/DeleteModal')
);
const RevisionModal = lazy(
  async () => await import('~/features/page/RevisionModal/RevisionModal')
);

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      pageQueryOptions.findOne({
        wikiId: params.wikiId!,
        pageId: params.pageId!,
      })
    );

    if (odeServices.http().isResponseError()) {
      throw new Response('', {
        status: odeServices.http().latestResponse.status,
        statusText: odeServices.http().latestResponse.statusText,
      });
    }

    return data;
  };

export const action =
  (queryClient: QueryClient) =>
  async ({ params }: ActionFunctionArgs) => {
    await wikiService.deletePage({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
    });

    /**
     * We invalidate wiki and pages queries
     */
    await queryClient.invalidateQueries();

    return redirect(`/id/${params.wikiId}`);
  };

export const Page = () => {
  const params = useParams();
  const editorRef = useRef<EditorRef>(null);
  const openDeleteModal = useOpenDeleteModal();
  const openVersionsModal = useOpenRevisionModal();

  const { setSelectedNodeId } = useTreeActions();

  const { isPending, error, data } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

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
    createComment.mutate({
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
    updateComment.mutate({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      commentId,
      comment,
    });
  };

  const handleOnDeleteComment = async (commentId: string) => {
    deleteComment.mutate({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      commentId,
    });
  };

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return data ? (
    <div className="d-flex flex-column mt-24 ms-md-24 me-md-16">
      <PageHeader page={data} />
      <Editor
        ref={editorRef}
        content={data.content}
        mode="read"
        variant="ghost"
        visibility="protected"
      ></Editor>

      <Comments
        comments={data.comments}
        options={{
          maxCommentLength: MAX_COMMENT_LENGTH,
          maxComments: MAX_COMMENTS,
        }}
        callbacks={{
          post: (comment) => handleOnPostComment(comment),
          put: ({ comment, commentId }) =>
            handleOnPutcomment({ comment, commentId }),
          delete: (commentId) => handleOnDeleteComment(commentId),
        }}
      />

      <Suspense fallback={<LoadingScreen position={false} />}>
        {openDeleteModal && <DeleteModal />}
        {openVersionsModal && <RevisionModal />}
      </Suspense>
    </div>
  ) : null;
};
