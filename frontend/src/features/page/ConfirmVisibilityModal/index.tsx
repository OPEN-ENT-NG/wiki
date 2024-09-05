import { Button, Modal, useOdeClient } from '@edifice-ui/react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Form, useActionData } from 'react-router-dom';
import { Page } from '~/models';
import { useOpenConfirmVisibilityModal, useWikiActions } from '~/store';

export default function ConfirmVisibilityModal({ page }: { page: Page }) {
  const actionData = useActionData() as {
    title: string;
    content: string;
    isVisible: boolean;
  };

  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);
  const { setOpenConfirmVisibilityModal } = useWikiActions();
  const openConfirmVisibilityModal = useOpenConfirmVisibilityModal();

  return createPortal(
    <Modal
      id="confirm-visibility-page"
      isOpen={openConfirmVisibilityModal}
      onModalClose={() => setOpenConfirmVisibilityModal(false)}
    >
      <Modal.Header onModalClose={() => setOpenConfirmVisibilityModal(false)}>
        {page.isVisible
          ? t('wiki.page.editform.modal.confirm.notvisible.title')
          : t('wiki.page.editform.modal.confirm.visible.title')}
      </Modal.Header>
      <Modal.Body>
        {page.isVisible
          ? t('wiki.page.editform.modal.confirm.notvisible.content')
          : t('wiki.page.editform.modal.confirm.visible.content')}
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="tertiary"
          variant="ghost"
          onClick={() => setOpenConfirmVisibilityModal(false)}
        >
          {t('wiki.page.editform.cancel')}
        </Button>
        <Form
          action="confirmVisibility"
          method="post"
          onSubmit={() => setOpenConfirmVisibilityModal(false)}
        >
          <input
            type="hidden"
            name="actionData"
            value={JSON.stringify(actionData)}
          />
          <Button
            type="submit"
            color="primary"
            variant="filled"
            name="confirmVisibility"
          >
            {t('wiki.page.editform.save')}
          </Button>
        </Form>
      </Modal.Footer>
    </Modal>,
    document.getElementById('portal') as HTMLElement
  );
}
