import { Button, LoadingScreen, Modal } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
  useParams,
} from 'react-router-dom';
import {
  pageQueryOptions,
  useGetPage,
  wikiQueryOptions,
  wikiService,
} from '~/services';
import { getWikiActions, useOpenDeleteModal } from '~/store';

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

export const action = (queryClient: QueryClient) =>
  async function action({ params }: ActionFunctionArgs) {
    const result = await wikiService.deletePage({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
    });

    console.log({ result });

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

    return redirect(`/id/${params.wikiId}`);
  };

export const Page = () => {
  const params = useParams();

  const { isPending, error, data } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  const openDeleteModal = useOpenDeleteModal();
  const { setOpenDeleteModal } = getWikiActions();

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  const hasChildren = false;

  return (
    <>
      <div>{data.title}</div>
      <button type="button" onClick={() => setOpenDeleteModal(true)}>
        supprimer page
      </button>
      {openDeleteModal && (
        <Modal
          id="delete-page"
          isOpen={openDeleteModal}
          onModalClose={() => setOpenDeleteModal(false)}
        >
          <Modal.Header onModalClose={() => setOpenDeleteModal(false)}>
            {!hasChildren
              ? 'Suppression de la page'
              : 'Suppression des pages et sous-pages'}
          </Modal.Header>
          <Modal.Subtitle>
            {!hasChildren
              ? 'Souhaitez-vous supprimer la page ?'
              : 'Souhaitez-vous supprimer la page et ses sous-pages ?'}
          </Modal.Subtitle>
          <Modal.Body>&nbsp;</Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="tertiary"
              variant="ghost"
              onClick={() => setOpenDeleteModal(false)}
            >
              Annuler
            </Button>
            <Form
              action="destroy"
              method="post"
              onSubmit={() => setOpenDeleteModal(false)}
            >
              <Button type="submit" color="danger" variant="filled">
                {!hasChildren
                  ? 'Supprimer la page'
                  : 'Supprimer la page et les sous-pages'}
              </Button>
            </Form>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
