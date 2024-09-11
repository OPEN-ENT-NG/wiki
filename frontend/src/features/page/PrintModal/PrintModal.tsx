import { Button, Checkbox, Modal, Radio } from '@edifice-ui/react';
import { createPortal } from 'react-dom';
import { useCheckablePrint } from '~/hooks/useCheckablePrint';
import { useTranslation } from 'react-i18next';
import { useOpenPrintModal, useWikiActions } from '~/store';

export default function PrintModal() {
  const { t } = useTranslation('wiki');
  const openPrintModal = useOpenPrintModal();
  const { setOpenPrintModal } = useWikiActions();

  const {
    handleOnGroupChange,
    handleOnPrintComment,
    printComment,
    printGroup,
  } = useCheckablePrint();

  return createPortal(
    <Modal
      id="print-page"
      isOpen={openPrintModal}
      onModalClose={() => setOpenPrintModal(false)}
    >
      <div className="d-flex flex-column gap-24">
        <Modal.Header onModalClose={() => setOpenPrintModal(false)}>
          {t('wiki.modal.print.header')}
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column gap-32">
            <div className="d-flex flex-column gap-16">
              <Radio
                model={printGroup}
                label={t('wiki.modal.print.radio.page')}
                checked={printGroup === 'onePage'}
                onChange={handleOnGroupChange}
                value="onePage"
              />
              <Radio
                model={printGroup}
                label={t('wiki.modal.print.radio.pages')}
                checked={printGroup === 'allPages'}
                onChange={handleOnGroupChange}
                value="allPages"
              />
            </div>
            <Checkbox
              data-testid="th-checkbox"
              label={t('wiki.modal.print.checkbox.label')}
              checked={printComment}
              onChange={handleOnPrintComment}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            data-testid="cancel-button"
            color="tertiary"
            variant="ghost"
            onClick={() => setOpenPrintModal(false)}
          >
            {t('wiki.modal.print.page.cancel')}
          </Button>

          <Button type="button" color="primary" variant="filled">
            {t('wiki.modal.print.button.print')}
          </Button>
        </Modal.Footer>
      </div>
    </Modal>,
    document.getElementById('portal') as HTMLElement
  );
}
