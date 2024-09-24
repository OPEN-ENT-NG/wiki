import { useDate } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';
import { useRevision } from '~/hooks/useRevision';
import { Revision } from '~/models/revision';
import { useOpenRevisionModal, useUserRights, useWikiActions } from '~/store';

export const useRevisionModal = ({
  data,
  selectedItems,
}: {
  data: Revision[] | undefined;
  selectedItems: string[];
}) => {
  const openVersionsModal = useOpenRevisionModal();
  const { isRestoring, restoreRevisionById } = useRevision();
  const userRights = useUserRights();
  const canManage = userRights.manager;

  const { formatDate } = useDate();
  const { t } = useTranslation('wiki');
  const { setOpenRevisionModal } = useWikiActions();

  const items = [
    t('wiki.table.head.author'),
    t('wiki.table.head.state'),
    t('wiki.table.head.modificationDate'),
    t('wiki.table.head.action'),
  ];

  const findSelectedItem =
    selectedItems.length === 1
      ? data?.find((revision) => revision._id === selectedItems[0])
      : undefined;

  const isLastVersion =
    selectedItems.length === 1 && data?.[0]?._id === selectedItems[0];

  const isSelectedItemVisible = findSelectedItem?.isVisible ?? false;

  const disabledRestoreButton =
    isRestoring ||
    selectedItems.length !== 1 ||
    (!isSelectedItemVisible && !canManage) ||
    isLastVersion;

  const disabledVersionComparison =
    selectedItems.length < 2 || selectedItems.length > 2;

  const restoreSelection = async () => {
    if (selectedItems.length !== 1) {
      return;
    }
    const item = selectedItems[0];
    await restoreRevisionById(item);
    // close modal
    setOpenRevisionModal(false);
  };

  return {
    items,
    openVersionsModal,
    canManage,
    t,
    isLastVersion,
    disabledRestoreButton,
    disabledVersionComparison,
    formatDate,
    setOpenRevisionModal,
    restoreSelection,
  };
};
