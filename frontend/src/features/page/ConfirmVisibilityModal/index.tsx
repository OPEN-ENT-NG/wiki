import {
  Button,
  FormControl,
  Input,
  Modal,
  useOdeClient,
} from '@edifice-ui/react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Form, useActionData } from 'react-router-dom';
import { Page } from '~/models';
import { useOpenConfirmVisibilityModal, useWikiActions } from '~/store';

export default function ConfirmVisibilityModal({ page }: { page: Page }) {
  const actionData = useActionData() as {
    title: string;
    content: string;
    toggle: boolean;
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
        {page.isVisible &&
          t('wiki.page.editform.modal.confirm.notvisible.title')}
        {!page.isVisible && t('wiki.page.editform.modal.confirm.visible.title')}
      </Modal.Header>
      <Modal.Body>
        {page.isVisible &&
          t('wiki.page.editform.modal.confirm.notvisible.content')}
        {!page.isVisible &&
          t('wiki.page.editform.modal.confirm.visible.content')}
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
          <FormControl id="title">
            <Input
              type="hidden"
              name="title"
              value={actionData.title}
              size="sm"
            />
          </FormControl>
          <FormControl id="content">
            <Input
              type="hidden"
              name="content"
              value={actionData.content}
              size="sm"
            />
          </FormControl>
          <FormControl id="toggle">
            <Input
              type="hidden"
              name="toggle"
              value={String(actionData.toggle)}
              size="sm"
            />
          </FormControl>
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
