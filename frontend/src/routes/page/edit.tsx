import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { ActionFunctionArgs, redirect } from 'react-router-dom';
import { FormPage } from '~/features';
import { FormPageDataProps } from '~/hooks';
import { useRevision } from '~/hooks/useRevision/useRevision';
import { pageQueryOptions, wikiQueryOptions, wikiService } from '~/services';
import { getOpenConfirmVisibilityModal, getWikiActions } from '~/store';
import { getFormValue } from '~/utils/getFormValue';

const ConfirmVisibilityModal = lazy(
  async () =>
    await import(
      '~/features/page/ConfirmVisibilityModal/ConfirmVisibilityModal'
    ),
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
    const { addToastMessage } = getWikiActions();

    // submitting from confirm visibility modal form
    const isConfirmVisibilityForm: string = getFormValue(
      formData,
      'isConfirmVisibilityForm',
    );

    const actionData: FormPageDataProps = isConfirmVisibilityForm
      ? (JSON.parse(getFormValue(formData, 'actionData')) as FormPageDataProps)
      : {
          title: getFormValue(formData, 'title'),
          content: getFormValue(formData, 'content'),
          isHidden: getFormValue(formData, 'isHidden') === 'true',
        };

    // if submitting from page edit form and page has subpages
    // and visibility has changed then we show confirm modal
    if (!isConfirmVisibilityForm) {
      const wikiData = await queryClient.ensureQueryData(
        wikiQueryOptions.findOne(params.wikiId!),
      );
      const pageData = wikiData.pages?.find(
        (page) => page._id === params.pageId,
      );
      if (pageData?.children && pageData.isVisible === actionData.isHidden) {
        getWikiActions().setOpenConfirmVisibilityModal(true);
        return actionData;
      }
    }

    // otherwise we call the updatePage service and redirect to current page.
    const data = await wikiService.updatePage({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      data: {
        title: actionData.title,
        content: actionData.content,
        isVisible: !actionData.isHidden,
      },
    });

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });
    await queryClient.invalidateQueries({ queryKey: pageQueryOptions.base });

    if (data.error) {
      addToastMessage({
        type: 'error',
        text: 'wiki.toast.error.edit.page',
      });
      return null;
    }

    addToastMessage({
      type: 'success',
      text: 'wiki.toast.success.edit.page',
    });

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
