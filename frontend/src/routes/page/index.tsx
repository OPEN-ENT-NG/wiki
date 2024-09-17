import { Editor, EditorRef } from '@edifice-ui/editor';
import { LoadingScreen, useOdeClient, useToast } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useActionData,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { PageHeader } from '~/features/page/PageHeader/PageHeader';
import { pageQueryOptions, useGetPage, wikiService } from '~/services';
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
    try {
      await wikiService.deletePage({
        wikiId: params.wikiId!,
        pageId: params.pageId!,
      });

      /**
       * We invalidate wiki and pages queries
       */
      await queryClient.invalidateQueries();

      return { success: true };
    } catch (error) {
      return { error };
    }
  };

export const Page = () => {
  const params = useParams();
  const toast = useToast();
  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);
  const navigate = useNavigate();
  const editorRef = useRef<EditorRef>(null);
  const openDeleteModal = useOpenDeleteModal();
  const openVersionsModal = useOpenRevisionModal();

  const actionData = useActionData() as {
    error: string;
    success: boolean;
  };

  useEffect(() => {
    if (actionData?.error) {
      toast.error(t('wiki.toast.error.update.page'));
    } else if (actionData?.success) {
      toast.success(t('wiki.toast.success.update.page'));
      navigate(`/id/${params.wikiId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

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
      <PageHeader page={data} />
      <Editor
        ref={editorRef}
        content={data.content}
        mode="read"
        variant="ghost"
        visibility="protected"
      ></Editor>

      <Suspense fallback={<LoadingScreen position={false} />}>
        {openDeleteModal && <DeleteModal />}
        {openVersionsModal && <RevisionModal />}
      </Suspense>
    </div>
  ) : null;
};
