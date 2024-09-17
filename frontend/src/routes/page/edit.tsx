import { LoadingScreen, useOdeClient, useToast } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  useActionData,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { FormPage } from '~/features/page/FormPage';
import {
  pageQueryOptions,
  useGetPage,
  wikiQueryOptions,
  wikiService,
} from '~/services';
import { Page } from '~/models';
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
      try {
        const data = await wikiService.updatePage({
          wikiId: params.wikiId!,
          pageId: params.pageId!,
          data: {
            title,
            content,
            isVisible,
          },
        });

      await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });
      await queryClient.invalidateQueries({ queryKey: pageQueryOptions.base });

        return { success: true, data };
      } catch (error) {
        return { error };
      }
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

    try {
      const data = await wikiService.updatePage({
        wikiId: params.wikiId!,
        pageId: params.pageId!,
        data: {
          title,
          content,
          isVisible,
        },
      });

      await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

      return { success: true, data };
    } catch (error) {
      return { error };
    }
  };

export const EditPage = () => {
  const toast = useToast();
  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);
  const navigate = useNavigate();
  const params = useParams();

  const actionData = useActionData() as {
    error: string;
    success: boolean;
    data: Page;
  };

  const { data, isPending } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  const openConfirmVisibilityModal = getOpenConfirmVisibilityModal();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(t('wiki.toast.error.update.page'));
    } else if (actionData?.success) {
      toast.success(t('wiki.toast.success.update.page'));
      navigate(`/id/${params.wikiId}/page/${actionData.data._id!}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

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
