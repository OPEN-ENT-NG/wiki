import { Button, Modal, useOdeClient } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from 'react-router-dom';

export const CancelModal = ({
  isOpen,
  onClose,
  onCancel,
  onReset,
  isNewPage,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onReset: () => void;
  isNewPage: boolean;
}) => {
  const { appCode } = useOdeClient();
  const { t } = useTranslation();
  const navigation = useNavigation();

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
          : t('wiki.page.edit.cancel.message', { nss: appCode })}
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="submit"
          color="danger"
          variant="outline"
          form="myForm"
          onClick={onReset}
          isLoading={navigation.state === 'submitting'}
        >
          {isNewPage
            ? t('wiki.page.create.cancel.button.save', { ns: appCode })
            : t('wiki.page.edit.cancel.button.save', { ns: appCode })}
        </Button>
        <Button
          type="button"
          color="danger"
          variant="filled"
          onClick={onCancel}
        >
          {isNewPage
            ? t('wiki.page.create.cancel.button.unsaved', { ns: appCode })
            : t('wiki.page.edit.cancel.button.unsaved', { ns: appCode })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
