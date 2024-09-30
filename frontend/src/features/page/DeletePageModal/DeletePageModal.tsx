import { Alert, Button, Modal, useOdeClient } from '@edifice-ui/react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Form, useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';
import { useOpenDeleteModal, useWikiActions } from '~/store';

export default function DeletePageModal({ listPage }: { listPage?: boolean }) {
  const params = useParams();
  const openDeleteModal = useOpenDeleteModal();

  const { t } = useTranslation('wiki');
  const { user } = useOdeClient();
  const { setOpenDeleteModal } = useWikiActions();
  const { data: wiki } = useGetWiki(params.wikiId!);

  // Find current page
  const findPage = wiki?.pages.find((page) => page._id === params.pageId);
  // Check if current page has children
  const pageChildren = listPage ?? findPage?.children;

  return createPortal(
    <Modal
      id="delete-page"
      isOpen={openDeleteModal}
      onModalClose={() => setOpenDeleteModal(false)}
    >
      <Modal.Header onModalClose={() => setOpenDeleteModal(false)}>
        {pageChildren
          ? t('wiki.modal.delete.pages.header')
          : t('wiki.modal.delete.page.header')}
      </Modal.Header>
      <Modal.Subtitle>
        {pageChildren
          ? t('wiki.modal.delete.pages.subtitle')
          : t('wiki.modal.delete.page.subtitle')}
      </Modal.Subtitle>
      <Modal.Body>
        {pageChildren && (
          <Alert type="warning">{t('wiki.modal.delete.pages.warning')}</Alert>
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
        <Form
          action="destroy"
          method="post"
          onSubmit={() => setOpenDeleteModal(false)}
        >
          <Button
            type="submit"
            color="danger"
            variant="filled"
            name="destroy"
            value={user?.userId}
          >
            {pageChildren
              ? t('wiki.modal.delete.pages.btn')
              : t('wiki.modal.delete.page.btn')}
          </Button>
        </Form>
      </Modal.Footer>
    </Modal>,
    document.getElementById('portal') as HTMLElement
  );
}
