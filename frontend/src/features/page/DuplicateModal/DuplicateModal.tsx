import { IResource } from '@edifice.io/client';
import {
  Alert,
  Button,
  LoadingScreen,
  Modal,
  useEdificeClient,
} from '@edifice.io/react';
import { InternalLinker } from '@edifice.io/react/multimedia';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFilteredWikis } from '~/hooks/useFilteredWikis';
import {
  useDuplicatePage,
  useGetAllWikisAsResources,
  useGetPage,
  useGetWiki,
} from '~/services';
import { getOpenDuplicateModal, useWikiActions } from '~/store';
import { getToastActions } from '~/store/toast';
/**
 * Duplicate modal props
 */
interface DuplicateModalProps {
  pageId: string;
  wikiId: string;
}
/**
 * Duplicate modal component
 * @param pageId - The id of the page to duplicate
 * @param wikiId - The id of the wiki where the page is located
 * @returns The duplicate modal component
 */
export const DuplicateModal: FC<DuplicateModalProps> = ({ pageId, wikiId }) => {
  const [isDuplicating, setIsDuplicating] = useState<boolean>(false);
  const navigate = useNavigate();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);
  const openDuplicateModal = getOpenDuplicateModal();
  const { data: wikis, isPending: isLoadingWikis } =
    useGetAllWikisAsResources();
  const { data: sourceWiki, isPending: isLoadingSourceWiki } =
    useGetWiki(wikiId);
  const { filteredWikis, isLoading: isLoadingFilteredWikis } =
    useFilteredWikis(wikis);
  const { data: sourcePage, isPending: isLoadingSourcePage } = useGetPage({
    wikiId,
    pageId,
  });
  const { setOpenDuplicateModal } = useWikiActions();
  const duplicateMutation = useDuplicatePage();
  const [destinationWikiId, setDestinationWikiId] = useState<string | null>(
    null,
  );

  const handleOnDuplicate = useCallback(
    async (destinationWikiId: string) => {
      setIsDuplicating(true);

      const { addToastMessage } = getToastActions();

      // Call duplicate mutation
      const result = await duplicateMutation.mutateAsync({
        destinationWikiId,
        data: {
          title: sourcePage?.title ?? '',
          content: sourcePage?.content ?? '',
          isVisible: sourcePage?.isVisible ?? false,
        },
      });

      if (result.error) {
        addToastMessage({
          type: 'error',
          text: 'wiki.toast.error.duplicate.page',
        });
        return null;
      }

      addToastMessage({
        type: 'success',
        text: 'wiki.toast.success.duplicate.page',
      });
      // Close modal and navigate to new page
      setIsDuplicating(false);
      setOpenDuplicateModal(false);
      navigate(`/id/${destinationWikiId}/page/${result._id}`);
    },
    [
      duplicateMutation,
      setOpenDuplicateModal,
      sourcePage,
      navigate,
      sourceWiki,
    ],
  );
  const onSelectDestinationWiki = useCallback(
    (resources: IResource[]) => {
      if (resources.length > 0) {
        const destinationWikiId = resources[0].assetId;
        setDestinationWikiId(destinationWikiId);
      }
    },
    [setDestinationWikiId],
  );
  // If wikis, source page or filtered wikis are loading, show loading screen
  if (
    isLoadingWikis ||
    isLoadingSourcePage ||
    isLoadingFilteredWikis ||
    isLoadingSourceWiki
  )
    return <LoadingScreen />;
  return (
    <Modal
      id="duplicate-modal"
      isOpen={openDuplicateModal}
      onModalClose={() => setOpenDuplicateModal(false)}
      size="lg"
      scrollable={true}
    >
      <Modal.Header onModalClose={() => setOpenDuplicateModal(false)}>
        {t('wiki.page.duplicate.modal.title')}
      </Modal.Header>
      <Modal.Body>
        <div className="mb-24">
          <Alert type="info">
            <span style={{ whiteSpace: 'pre-wrap' }}>
              {t('wiki.page.duplicate.modal.alert')}
            </span>
          </Alert>
        </div>
        <InternalLinker
          appCode="wiki"
          multiple={false}
          defaultAppCode="wiki"
          applicationList={[{ application: appCode, displayName: 'Wiki' }]}
          resourceList={filteredWikis?.map((wiki) => ({
            ...wiki,
            path: `/wiki/id:${wiki.id}`,
          }))}
          showApplicationSelector={false}
          onSelect={onSelectDestinationWiki}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="ghost" onClick={() => setOpenDuplicateModal(false)}>
          {t('wiki.page.duplicate.modal.cancel')}
        </Button>
        <Button
          color="primary"
          isLoading={isDuplicating}
          disabled={isDuplicating || !destinationWikiId}
          onClick={() => handleOnDuplicate(destinationWikiId!)}
        >
          {t('wiki.page.duplicate.modal.submit')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
