import { LoadingScreen } from '@edifice-ui/react';
import { lazy, Suspense } from 'react';
import { FormPage } from '~/features';
import { useRevision } from '~/hooks/useRevision/useRevision';
import { getOpenConfirmVisibilityModal } from '~/store';
import { pageEditAction } from '~/routes/page/pageEditAction';

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
export const editAction = pageEditAction;

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
