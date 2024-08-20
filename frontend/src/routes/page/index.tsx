import { Editor, EditorRef } from '@edifice-ui/editor';
import { Button, LoadingScreen, Modal } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
  useParams,
} from 'react-router-dom';
import { ContentHeader } from '~/features/wiki/ContentHeader';
import {
  pageQueryOptions,
  useGetPage,
  useGetWiki,
  wikiQueryOptions,
  wikiService,
} from '~/services';
import { useOpenDeleteModal, useTreeActions, useWikiActions } from '~/store';

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

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

    return redirect(`/id/${params.wikiId}`);
  };

export const Page = () => {
  const params = useParams();
  const editorRef = useRef<EditorRef>(null);
  const openDeleteModal = useOpenDeleteModal();

  const { t } = useTranslation('wiki');
  const { setOpenDeleteModal } = useWikiActions();
  const { setSelectedNodeId } = useTreeActions();

  const { isPending, error, data } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  const { data: wiki } = useGetWiki(params.wikiId!);

  // Find current page
  const findPage = wiki?.pages.find((page) => page._id === params.pageId);
  // Check if current page has children
  const hasChildren = findPage?.children;

  useEffect(() => {
    if (data) {
      setSelectedNodeId(data._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleOnDeletePage = () => {
    console.log({ findPage });
  };

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

      <button onClick={() => setOpenDeleteModal(true)}>supprimer page</button>
      {openDeleteModal && (
        <Modal
          id="delete-page"
          isOpen={openDeleteModal}
          onModalClose={() => setOpenDeleteModal(false)}
        >
          <Modal.Header onModalClose={() => setOpenDeleteModal(false)}>
            {hasChildren
              ? t('wiki.modal.delete.pages.header')
              : t('wiki.modal.delete.page.header')}
          </Modal.Header>
          <Modal.Subtitle>
            {hasChildren
              ? t('wiki.modal.delete.pages.subtitle')
              : t('wiki.modal.delete.page.subtitle')}
          </Modal.Subtitle>
          <Modal.Body>&nbsp;</Modal.Body>
          <Modal.Footer>
            <Button
              color="tertiary"
              variant="ghost"
              onClick={() => setOpenDeleteModal(false)}
            >
              {t('wiki.modal.delete.page.cancel')}
            </Button>
            <Form
              action="destroy"
              method="post"
              onSubmit={() => setOpenDeleteModal(false)}
            >
              <Button
                // type="submit"
                color="danger"
                variant="filled"
                onClick={handleOnDeletePage}
              >
                {hasChildren
                  ? t('wiki.modal.delete.pages.btn')
                  : t('wiki.modal.delete.page.btn')}
              </Button>
            </Form>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  ) : null;
};
