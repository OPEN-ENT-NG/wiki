import { Alert, Button, Modal } from '@edifice-ui/react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router-dom';
import { useOpenDeleteModal, useUserRights, useWikiActions } from '~/store';

export default function DeleteListModal({
  selectedPages,
}: {
  selectedPages: string[];
}) {
  const openDeleteModal = useOpenDeleteModal();
  const userRights = useUserRights();

  const { t } = useTranslation('wiki');
  const { setOpenDeleteModal } = useWikiActions();
  const fetcher = useFetcher();

  const canManage = userRights.manager;

  return createPortal(
    <Modal
      id="delete-list-page"
      isOpen={openDeleteModal}
      onModalClose={() => setOpenDeleteModal(false)}
    >
      <Modal.Header onModalClose={() => setOpenDeleteModal(false)}>
        {t('wiki.modal.delete.page.header')}
      </Modal.Header>
      <Modal.Subtitle>{t('wiki.modal.delete.page.subtitle')}</Modal.Subtitle>
      <Modal.Body>
        {!canManage && (
          <Alert type="warning">
            {t('wiki.modal.delete.listpage.warning')}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="tertiary"
          variant="ghost"
          onClick={() => setOpenDeleteModal(false)}
        >
          {t('wiki.modal.delete.page.cancel')}
        </Button>
        <fetcher.Form
          action="destroy"
          method="post"
          onSubmit={() => setOpenDeleteModal(false)}
        >
          <Button
            type="submit"
            color="danger"
            variant="filled"
            name="intent"
            value={JSON.stringify(selectedPages)}
          >
            {t('wiki.modal.delete.page.btn')}
          </Button>
        </fetcher.Form>
      </Modal.Footer>
    </Modal>,
    document.getElementById('portal') as HTMLElement
  );
}
