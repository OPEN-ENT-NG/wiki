import { IResource } from '@edifice.io/client';
import {
  Alert,
  Button,
  LoadingScreen,
  Modal,
  Tooltip,
  useEdificeClient,
} from '@edifice.io/react';
import { IconInfoCircle } from '@edifice.io/react/icons';
import { InternalLinker } from '@edifice.io/react/multimedia';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFilteredWikis } from '~/hooks/useFilteredWikis';
import {
  baseURL,
  useDuplicatePage,
  useGetAllWikisAsResources,
  useGetPagesFromWiki,
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
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);
  const openDuplicateModal = getOpenDuplicateModal();
  const { data: wikis, isPending: isLoadingWikis } =
    useGetAllWikisAsResources();
  const { filteredWikis, isLoading: isLoadingFilteredWikis } =
    useFilteredWikis(wikis);
  const { data: pages, isLoading: isLoadingPages } = useGetPagesFromWiki({
    wikiId,
    content: false,
  });
  const { setOpenDuplicateModal } = useWikiActions();
  const {
    mutation: duplicateMutation,
    shouldIncludeSubPages,
    toggleShouldIncludeSubPages,
  } = useDuplicatePage();
  const [destinationWikiIds, setDestinationWikiIds] = useState<string[]>([]);

  const handleOnDuplicate = useCallback(
    async (destinationWikiIds: string[]) => {
      setIsDuplicating(true);

      const { addToastMessage } = getToastActions();

      // Call duplicate mutation
      const result = await duplicateMutation.mutateAsync({
        sourceWikiId: wikiId,
        sourcePageId: pageId,
        targetWikiIds: [...destinationWikiIds],
        shouldIncludeSubPages,
      });

      if (typeof result === 'object' && 'error' in result) {
        // Display error toast
        addToastMessage({
          type: 'error',
          text: 'wiki.toast.error.duplicate.page',
        });
        return null;
      } else {
        // Display success toast
        addToastMessage({
          type: 'success',
          text: 'wiki.toast.success.duplicate.page',
        });

        // Close modal and navigate to new page
        setIsDuplicating(false);
        setOpenDuplicateModal(false);
        // Open new pages in new tabs
        if (result.newPageIds) {
          for (const [, page] of result.newPageIds.entries()) {
            window.open(
              `${baseURL}/id/${page.wikiId}/page/${page.pageId}`,
              '_blank',
            );
          }
        }
      }
    },
    [
      duplicateMutation,
      setOpenDuplicateModal,
      wikiId,
      pageId,
      shouldIncludeSubPages,
    ],
  );
  const onSelectDestinationWiki = useCallback(
    (resources: IResource[]) => {
      if (resources.length > 0) {
        const destinationWikiIds = resources.map(
          (resource) => resource.assetId,
        );
        setDestinationWikiIds(destinationWikiIds);
      }
    },
    [setDestinationWikiIds],
  );
  // If wikis, source page or filtered wikis are loading, show loading screen
  if (isLoadingWikis || isLoadingFilteredWikis || isLoadingPages)
    return <LoadingScreen />;
  // Check if the source page has subpages
  const hasSubPages = pages?.some((page) => page.parentId === pageId);
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
        {hasSubPages && (
          <div className="d-flex mb-24 gap-8">
            <label className="switch">
              <input
                type="checkbox"
                checked={shouldIncludeSubPages}
                onChange={toggleShouldIncludeSubPages}
              />
              <span className="slider round"></span>
            </label>
            <label className="form-label">
              {t('wiki.page.duplicate.checkbox.label')}
            </label>
            <Tooltip
              message={t('wiki.page.duplicate.checkbox.tooltip')}
              placement="bottom-start"
            >
              <IconInfoCircle className="c-pointer" height="18" />
            </Tooltip>
          </div>
        )}
        <InternalLinker
          appCode="wiki"
          multiple={true}
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
          disabled={isDuplicating || destinationWikiIds.length === 0}
          onClick={() => handleOnDuplicate(destinationWikiIds)}
        >
          {t('wiki.page.duplicate.modal.submit')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
