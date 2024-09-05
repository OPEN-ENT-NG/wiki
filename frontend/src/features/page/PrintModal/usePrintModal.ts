import { useTranslation } from 'react-i18next';
import { useOpenPrintModal, useWikiActions } from '~/store';

export const usePrintModal = () => {
  const { t } = useTranslation('wiki');
  const openPrintModal = useOpenPrintModal();
  const { setOpenPrintModal } = useWikiActions();

  return {
    t,
    openPrintModal,
    setOpenPrintModal,
  };
};
