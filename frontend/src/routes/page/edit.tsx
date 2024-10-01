import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { useRevision } from '~/hooks/useRevision';
import { ActionFunctionArgs, redirect } from 'react-router-dom';
import { FormPage } from '~/features/page/FormPage';
import { pageQueryOptions, wikiQueryOptions, wikiService } from '~/services';
import { getOpenConfirmVisibilityModal, getWikiActions } from '~/store';
import { getFormValue } from '~/utils/getFormValue';
import { FormPageDataProps } from '~/hooks/useFormPage';

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
    const formData: FormData = await request.formData();

    // submitting from confirm visibility modal form
    const isConfirmVisibilityForm: string = getFormValue(
      formData,
      'isConfirmVisibilityForm'
    );

    const actionData: FormPageDataProps = isConfirmVisibilityForm
      ? (JSON.parse(getFormValue(formData, 'actionData')) as FormPageDataProps)
      : {
          title: getFormValue(formData, 'title'),
          content: getFormValue(formData, 'content'),
          isVisible: getFormValue(formData, 'isVisible') === 'true',
        };

    // if submitting from page edit form and page has subpages
    // and visibility has changed then we show confirm modal
    if (!isConfirmVisibilityForm) {
      const wikiData = await queryClient.ensureQueryData(
        wikiQueryOptions.findOne(params.wikiId!)
      );
      const pageData = wikiData.pages?.find(
        (page) => page._id === params.pageId
      );
      if (pageData?.children && pageData.isVisible !== actionData.isVisible) {
        getWikiActions().setOpenConfirmVisibilityModal(true);
        return actionData;
      }
    }

    // otherwise we call the updatePage service and redirect to current page.
    await wikiService.updatePage({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      data: actionData,
    });

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });
    await queryClient.invalidateQueries({ queryKey: pageQueryOptions.base });

    return redirect(`/id/${params.wikiId}/page/${params.pageId!}`);
  };

export const EditPage = () => {
  const { getPageFromRoute } = useRevision();
  const { data, isPending } = getPageFromRoute();

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
