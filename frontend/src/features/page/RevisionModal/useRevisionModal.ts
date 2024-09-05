import { useDate } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';
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

  const isSelectedItemVisible = findSelectedItem?.isVisible ?? false;

  const disabledRestoreButton =
    selectedItems.length !== 1 || (!isSelectedItemVisible && !canManage);
  const disabledVersionComparison =
    selectedItems.length < 2 || selectedItems.length > 2;

  return {
    items,
    openVersionsModal,
    canManage,
    t,
    disabledRestoreButton,
    disabledVersionComparison,
    formatDate,
    setOpenRevisionModal,
  };
};
