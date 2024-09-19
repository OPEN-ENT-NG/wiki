import {
  Alert,
  Badge,
  Button,
  Checkbox,
  LoadingScreen,
  Modal,
  Table,
} from '@edifice-ui/react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useCheckableTable } from '~/hooks/useCheckableTable';
import { Revision } from '~/models/revision';
import { useGetRevisionsPage } from '~/services';
import { useRevisionModal } from './useRevisionModal';
import { useCallback } from 'react';

const RevisionModal = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetRevisionsPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  const {
    selectedItems,
    allItemsSelected,
    isIndeterminate,
    handleOnSelectAllItems,
    handleOnSelectItem,
  } = useCheckableTable<Revision>(data);

  const {
    t,
    items,
    formatDate,
    openVersionsModal,
    setOpenRevisionModal,
    disabledVersionComparison,
    disabledRestoreButton,
  } = useRevisionModal({ data, selectedItems });

  const handleOnOpen = useCallback(
    (id: string) => {
      setOpenRevisionModal(false);
      navigate(`/id/${params.wikiId}/page/${params.pageId}/version/${id}`);
    },
    [setOpenRevisionModal, params, navigate]
  );

  if (isLoading) return <LoadingScreen />;

  return createPortal(
    <Modal
      id="revision-modal"
      isOpen={openVersionsModal}
      size="lg"
      onModalClose={() => setOpenRevisionModal(false)}
    >
      <Modal.Header onModalClose={() => setOpenRevisionModal(false)}>
        {t('wiki.version.modal.title')}
      </Modal.Header>
      <Modal.Body>
        <div className="mb-24">
          <Alert type="info">
            <strong className="text-info">
              {t('wiki.version.modal.tips')}
            </strong>{' '}
            {t('wiki.version.modal.alert')}
          </Alert>
        </div>
        {data && (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    data-testid="th-checkbox"
                    className="m-auto"
                    checked={allItemsSelected}
                    indeterminate={isIndeterminate}
                    onChange={() => handleOnSelectAllItems(allItemsSelected)}
                  />
                </Table.Th>
                {items.map((theadItem) => (
                  <Table.Th key={theadItem}>{theadItem}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.map((item, index) => {
                const isLastVersion = index === 0;

                return (
                  <Table.Tr key={item._id}>
                    <Table.Td>
                      <Checkbox
                        data-testid={`checkbox-${item._id}`}
                        checked={selectedItems.includes(item._id)}
                        onChange={() => {
                          handleOnSelectItem(item._id);
                        }}
                      />
                    </Table.Td>
                    <Table.Td>{item.username}</Table.Td>
                    <Table.Td>
                      <Badge
                        variant={{
                          type: 'content',
                          background: true,
                          level: item.isVisible ? 'warning' : 'info',
                        }}
                      >
                        {item.isVisible
                          ? t('wiki.table.body.visible')
                          : t('wiki.table.body.invisible')}
                      </Badge>
                    </Table.Td>
                    <Table.Td className="fst-italic text-gray-700">
                      {formatDate(item.date)}
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="ghost"
                        disabled={isLastVersion}
                        onClick={() => handleOnOpen(item._id)}
                      >
                        {t('wiki.table.body.btn')}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          data-testid="cancel-button"
          color="tertiary"
          variant="ghost"
          onClick={() => setOpenRevisionModal(false)}
        >
          {t('wiki.version.cancel')}
        </Button>
        <Button
          data-testid="compare-button"
          color="primary"
          variant="outline"
          disabled={disabledVersionComparison}
        >
          {t('wiki.version.compare')}
        </Button>
        <Button
          data-testid="restore-button"
          color="primary"
          variant="filled"
          disabled={disabledRestoreButton}
        >
          {t('wiki.version.restore')}
        </Button>
      </Modal.Footer>
    </Modal>,
    document.getElementById('portal') as HTMLElement
  );
};

export default RevisionModal;
