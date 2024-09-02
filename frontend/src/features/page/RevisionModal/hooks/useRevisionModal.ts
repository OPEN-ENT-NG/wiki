import { useDate } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetRevisionsPage } from '~/services';
import { useOpenRevisionModal, useWikiActions } from '~/store';

export const useRevisionModal = () => {
  const params = useParams();
  const openVersionsModal = useOpenRevisionModal();

  const { formatDate } = useDate();
  const { t } = useTranslation('wiki');
  const { setOpenRevisionModal } = useWikiActions();
  const { data, isLoading } = useGetRevisionsPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  const items = [
    t('wiki.table.head.author'),
    t('wiki.table.head.state'),
    t('wiki.table.head.modificationDate'),
    t('wiki.table.head.action'),
  ];

  return {
    openVersionsModal,
    formatDate,
    setOpenRevisionModal,
    isLoading,
    items,
    data,
    t,
  };
};
