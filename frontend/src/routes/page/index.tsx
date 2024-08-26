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
import { ContentHeader } from '~/features/wiki/ContentHeader';
import { pageQueryOptions, useGetPage, wikiService } from '~/services';
import { useOpenDeleteModal, useTreeActions } from '~/store';

const DeleteModal = lazy(
  async () => await import('~/features/page/DeleteModal')
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

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return data ? (
    <div className="d-flex flex-column mt-24 ms-md-24 me-md-16">
      <ContentHeader page={data} />
      <Editor
        ref={editorRef}
        content={data.content}
        mode="read"
        variant="ghost"
        visibility="protected"
      ></Editor>

      <Suspense fallback={<LoadingScreen position={false} />}>
        {openDeleteModal && <DeleteModal />}
      </Suspense>
    </div>
  ) : null;
};
