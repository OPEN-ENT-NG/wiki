import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { ActionFunctionArgs, redirect, useParams } from 'react-router-dom';
import { FormPage } from '~/features/page/FormPage';
import { useGetPage, wikiQueryOptions, wikiService } from '~/services';
import { getOpenConfirmVisibilityModal, getWikiActions } from '~/store';

const ConfirmVisibilityModal = lazy(
  async () => await import('~/features/page/ConfirmVisibilityModal')
);

/**
 * Action called when submitting the Edition Page form.
 * @param queryClient
 * @returns
 * if page has children and visibility has changed then
 *  we return page form data to be used in visibility confirm modal
 * else
 *  we redirect to current page
 */
export const editAction =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const isVisible = formData.get('isVisible') === 'on';

    const wikiData = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!)
    );
    const pageData = wikiData.pages?.find((page) => page._id === params.pageId);

    const { setOpenConfirmVisibilityModal } = getWikiActions();

    // if current page has children we compare page visibility to toggle:
    // if page visibility has changed then we show confirm modal
    if (pageData?.children && pageData.isVisible !== isVisible) {
      setOpenConfirmVisibilityModal(true);
      return { title, content, isVisible };
    } else {
      // otherwise we call the updatePage service and redirect to current page.
      await wikiService.updatePage({
        wikiId: params.wikiId!,
        pageId: params.pageId!,
        data: {
          title,
          content,
          isVisible,
        },
      });

      await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

      return redirect(`/id/${params.wikiId}/page/${params.pageId!}`);
    }
  };

/**
 * Action called when submitting the visibility confirmation modal.
 * @param queryClient
 * @returns redirect to current page.
 */
export const confirmVisibilityAction =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    // get the hidden input from the Confirm Modal
    // the hidden input contains the page edit form data
    const formData = await request.formData();
    const { title, content, isVisible } = JSON.parse(
      formData.get('actionData') as string
    );

    await wikiService.updatePage({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      data: {
        title,
        content,
        isVisible,
      },
    });

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

    return redirect(`/id/${params.wikiId}/page/${params.pageId!}`);
  };

export const EditPage = () => {
  const params = useParams();

  const { data, isPending } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  const openConfirmVisibilityModal = getOpenConfirmVisibilityModal();

  if (isPending) return <LoadingScreen />;

  return data ? (
    <>
      <FormPage page={data} />

      <Suspense fallback={<LoadingScreen position={false} />}>
        {openConfirmVisibilityModal && <ConfirmVisibilityModal page={data} />}
      </Suspense>
    </>
  ) : null;
};
