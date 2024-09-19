import { Button, Modal, useOdeClient } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';

export const CancelModal = ({
  isOpen,
  onClose,
  onCancel,
  isNewPage,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  isNewPage: boolean;
}) => {
  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  return (
    <Modal
      id="CancelModal"
      onModalClose={onClose}
      size="md"
      isOpen={isOpen}
      focusId=""
      scrollable={true}
    >
      <Modal.Header onModalClose={onClose}>
        {isNewPage
          ? t('wiki.page.create.cancel.title', { ns: appCode })
          : t('wiki.page.edit.cancel.title', { ns: appCode })}
      </Modal.Header>
      <Modal.Body>
        {isNewPage
          ? t('wiki.page.create.cancel.message', { ns: appCode })
          : t('wiki.page.edit.cancel.message', { ns: appCode })}
      </Modal.Body>
      <Modal.Footer>
        <Button color="tertiary" variant="ghost" onClick={onClose}>
          {isNewPage
            ? t('wiki.page.create.cancel.button.back', { ns: appCode })
            : t('wiki.page.edit.cancel.button.back', { ns: appCode })}
        </Button>
        <Button
          type="button"
          color="danger"
          variant="filled"
          onClick={onCancel}
        >
          {isNewPage
            ? t('wiki.page.create.cancel.button.cancel', { ns: appCode })
            : t('wiki.page.edit.cancel.button.cancel', { ns: appCode })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
