import { Alert, Button, Modal } from '@edifice-ui/react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useFetcher, useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';
import { useOpenDeleteModal, useUserRights, useWikiActions } from '~/store';

const DeleteListModal = ({ selectedPages }: { selectedPages: string[] }) => {
  const openDeleteModal = useOpenDeleteModal();
  const userRights = useUserRights();
  const params = useParams();
  const { t } = useTranslation('wiki');
  const { setOpenDeleteModal } = useWikiActions();

  const fetcher = useFetcher();
  const canManage = userRights.manager;

  // Get the wiki data for the current wiki ID
  const { data: wiki } = useGetWiki(params.wikiId!);

  // Find any selected page that has children
  const hasSelectedPagesWithChildren = wiki?.pages?.some(
    (page) =>
      selectedPages.includes(page._id) &&
      page.children &&
      page.children.length > 0,
  );

  const hasChildren = hasSelectedPagesWithChildren;

  return createPortal(
    <Modal
      id="delete-pages-list"
      isOpen={openDeleteModal}
      onModalClose={() => setOpenDeleteModal(false)}
    >
      <Modal.Header onModalClose={() => setOpenDeleteModal(false)}>
        {hasChildren
          ? t('wiki.modal.delete.pages.header')
          : t('wiki.modal.delete.page.header')}
      </Modal.Header>
      <Modal.Subtitle>
        {hasChildren
          ? t('wiki.modal.delete.pages.subtitle')
          : t('wiki.modal.delete.page.subtitle')}
      </Modal.Subtitle>
      <Modal.Body>
        {!canManage && (
          <Alert type="warning">
            {t('wiki.modal.delete.listpage.warning')}
          </Alert>
        )}
        {hasChildren && (
          <Alert type="warning">
            {t('wiki.modal.delete.listpages.warning')}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="tertiary"
          variant="ghost"
          onClick={() => setOpenDeleteModal(false)}
          data-testid="cancel-button"
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
            data-testid="delete-button"
          >
            {hasChildren
              ? t('wiki.modal.delete.pages.btn')
              : t('wiki.modal.delete.page.btn')}
          </Button>
        </fetcher.Form>
      </Modal.Footer>
    </Modal>,
    document.getElementById('portal') as HTMLElement,
  );
};

export default DeleteListModal;
