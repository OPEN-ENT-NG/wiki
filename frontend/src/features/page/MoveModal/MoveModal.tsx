import { ID } from '@edifice.io/client';
import { Alert, Button, LoadingScreen, Modal, Tree } from '@edifice.io/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFilterCurrentPageFromTree } from '~/hooks/useFilterCurrentPageFromTree';
import { useReorganizeTree } from '~/hooks/useReorganizeTree';
import { useUpdatePages } from '~/hooks/useUpdatePages';
import { useGetPage, useGetPagesFromWiki } from '~/services';
import { useOpenMoveModal, useTreeData, useWikiActions } from '~/store';
import { getToastActions } from '~/store/toast';

interface MoveModalProps {
  pageId: string;
  wikiId: string;
}

export const MoveModal = ({ wikiId, pageId }: MoveModalProps) => {
  const { t } = useTranslation();
  const treeData = useTreeData();
  const isOpen = useOpenMoveModal();
  const { data: dataPage, isLoading: isLoadingPage } = useGetPage({
    wikiId,
    pageId,
  });
  const { data: dataPages, isLoading: isLoadingPages } = useGetPagesFromWiki({
    wikiId,
    content: false,
  });
  const { reorganize, transformToUpdateData } = useReorganizeTree();
  const { handleSortPage } = useUpdatePages(wikiId);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const { setOpenMoveModal } = useWikiActions();
  const { addToastMessage } = getToastActions();
  const [selectedDestination, setSelectedDestination] = useState<ID | null>(
    null,
  );
  // Filter the current page and its children from the tree data
  const filteredTreeData = useFilterCurrentPageFromTree(treeData, pageId);
  const handleMove = useCallback(async () => {
    // Find the current page in the tree data
    if (selectedDestination && dataPages && dataPage) {
      try {
        setIsMoving(true);
        // Update pages positions
        const reorganizedPages = reorganize({
          currentPageId: pageId,
          destinationPageId: selectedDestination,
          pages: treeData,
        });
        const updateData = transformToUpdateData(reorganizedPages);
        // Update pages
        handleSortPage(updateData);
        // Close the modal
        setOpenMoveModal(false);
        // Show success message
        addToastMessage({
          type: 'success',
          text: t('wiki.move.success'),
        });
      } catch (e) {
        console.error('Failed to move page', e);
        // Show error message
        addToastMessage({
          type: 'error',
          text: t('wiki.move.error'),
        });
      } finally {
        setIsMoving(false);
      }
    }
  }, [
    selectedDestination,
    dataPages,
    dataPage,
    treeData,
    pageId,
    reorganize,
    transformToUpdateData,
    handleSortPage,
    addToastMessage,
    t,
    setOpenMoveModal,
  ]);
  // If page is loading, show loading screen
  if (isLoadingPage || isLoadingPages) return <LoadingScreen />;

  return (
    <Modal
      id="duplicate-modal"
      isOpen={isOpen}
      size="lg"
      onModalClose={() => setOpenMoveModal(false)}
    >
      <Modal.Header onModalClose={() => setOpenMoveModal(false)}>
        {t('wiki.move.title', { name: dataPage?.title })}
      </Modal.Header>
      <Modal.Body>
        <Alert type="info" className="mb-24">
          <>
            {t('wiki.move.select.destination')}
            <ul>
              <li>{t('wiki.move.select.page')}</li>
              <li>{t('wiki.move.select.subpage')}</li>
            </ul>
          </>
        </Alert>

        <Tree
          nodes={filteredTreeData}
          selectedNodeId={selectedDestination}
          onTreeItemClick={setSelectedDestination}
          shouldExpandAllNodes
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="ghost" onClick={() => setOpenMoveModal(false)}>
          {t('wiki.move.cancel')}
        </Button>
        <Button
          color="primary"
          onClick={handleMove}
          disabled={!selectedDestination || isMoving}
        >
          {t('wiki.move.button')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
