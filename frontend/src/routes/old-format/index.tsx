import { Suspense, useEffect } from 'react';

import { LoadingScreen, useEdificeTheme } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';

import { odeServices } from '@edifice.io/client';
import ConfirmVisibilityModal from '~/features/page/ConfirmVisibilityModal/ConfirmVisibilityModal';
import DeletePageModal from '~/features/page/DeletePageModal/DeletePageModal';
import { DuplicateModal } from '~/features/page/DuplicateModal/DuplicateModal';
import { PageHeader } from '~/features/page/PageHeader/PageHeader';
import RevisionModal from '~/features/page/RevisionModal/RevisionModal';
import { pageQueryOptions, useGetPage } from '~/services/queries';
import {
  useOpenConfirmVisibilityModal,
  useOpenDeleteModal,
  useOpenDuplicateModal,
  useOpenMoveModal,
  useOpenRevisionModal,
} from '~/store';
import { MoveModal } from '~/features/page/MoveModal/MoveModal';

/** Load a wiki page OLD-FORMAT content */
export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { wikiId, pageId } = params;
    if (wikiId && pageId) {
      const data = await queryClient.ensureQueryData(
        pageQueryOptions.findOne({ wikiId, pageId, originalformat: true }),
      );

      if (odeServices.http().isResponseError()) {
        throw new Response('', {
          status: odeServices.http().latestResponse.status,
          statusText: odeServices.http().latestResponse.statusText,
        });
      }
      return data;
    }
    return null;
  };

export const Component = () => {
  const params = useParams();
  const { wikiId, pageId } = params;
  const openDeleteModal = useOpenDeleteModal();
  const openVersionsModal = useOpenRevisionModal();
  const openDuplicateModal = useOpenDuplicateModal();
  const openMoveModal = useOpenMoveModal();
  const openConfirmVisibilityModal = useOpenConfirmVisibilityModal();
  const { data } = useGetPage({
    wikiId: wikiId!,
    pageId: pageId!,
    originalformat: true,
  });
  const { theme } = useEdificeTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const link = document.getElementById('theme') as HTMLAnchorElement;
    if (link) link.href = `${theme?.themeUrl}theme.css`;
  }, [theme?.themeUrl]);

  const style = {
    margin: 'auto',
    padding: '16px',
    minHeight: '100vh',
    backgroundColor: '#fff',
  };

  return data ? (
    <div className="d-flex flex-column mt-24 ms-md-24 me-md-16">
      <PageHeader page={data} />
      <div
        style={style}
        contentEditable={false}
        dangerouslySetInnerHTML={{
          __html: data?.content ?? t('wiki.or.page.notfound.or.unauthorized'),
        }}
      />

      <Suspense fallback={<LoadingScreen position={false} />}>
        {openDeleteModal && <DeletePageModal />}
        {openVersionsModal && <RevisionModal pageId={params.pageId!} />}
        {openDuplicateModal && (
          <DuplicateModal pageId={params.pageId!} wikiId={params.wikiId!} />
        )}
        {openMoveModal && (
          <MoveModal wikiId={params.wikiId!} pageId={params.pageId!} />
        )}
        {openConfirmVisibilityModal && <ConfirmVisibilityModal page={data} />}
      </Suspense>
    </div>
  ) : null;
};
