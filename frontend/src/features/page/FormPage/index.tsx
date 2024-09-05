import { Editor } from '@edifice-ui/editor';
import { InfoCircle, Save } from '@edifice-ui/icons';
import {
  Button,
  FormControl,
  Input,
  Label,
  Tooltip,
  useOdeClient,
} from '@edifice-ui/react';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router-dom';
import { CancelModal } from '~/components/CancelModal';
import { Toggle } from '~/components/Toggle';
import { MAX_TITLE_LENGTH } from '~/config/init-config';
import { useCancelPage } from '~/hooks/useCancelPage';
import { useFormPage } from '~/hooks/useFormPage';
import { Page } from '~/models';

export const FormPage = ({ page }: { page?: Page }) => {
  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);
  const {
    handleOnContentChange,
    handleOnToggleChange,
    handleOnTitleChange,
    handleOnReset,
    isDisableButton,
    contentTitle,
    isSubmitting,
    isModified,
    isVisible,
    editorRef,
    content,
  } = useFormPage(page);
  const { handleOnButtonCancel, handleClosePage, isBlocked, blocker } =
    useCancelPage(isModified, page);

  return (
    <div className="ms-16 ms-lg-24 me-16 mt-24">
      <Form id="myForm" method="post" role="form">
        <FormControl id="inputForm" isRequired>
          <Label>{t('wiki.linkerform.pagetitle.label')}</Label>
          <Input
            name="title"
            type="text"
            size="md"
            maxLength={MAX_TITLE_LENGTH}
            placeholder={t('wiki.createform.input.placeholder')}
            value={contentTitle}
            onChange={handleOnTitleChange}
            autoFocus={true}
          ></Input>
        </FormControl>
        <FormControl id="toggleForm" className="d-flex mt-24 gap-8">
          <Toggle
            name="isVisible"
            checked={isVisible}
            onChange={handleOnToggleChange}
          />
          <Label>{t('wiki.createform.toggle.title')}</Label>
          <Tooltip
            message={t('wiki.createform.toggle.message')}
            placement="bottom-start"
          >
            <InfoCircle className="c-pointer" height="18" />
          </Tooltip>
        </FormControl>
        <div className="mt-16 page-content-editor">
          <Editor
            ref={editorRef}
            content={page?.content ?? ''}
            mode="edit"
            visibility="protected"
            onContentChange={handleOnContentChange}
            focus={null}
          ></Editor>
          <input type="hidden" name="content" value={content} />
        </div>
        <div className="d-flex align-items-center gap-8 justify-content-end mt-16">
          <Button type="button" variant="ghost" onClick={handleOnButtonCancel}>
            {t('wiki.editform.cancel')}
          </Button>
          <Button
            type="submit"
            variant="filled"
            leftIcon={<Save />}
            isLoading={isSubmitting}
            disabled={isDisableButton}
            onClick={handleOnReset}
          >
            {t('wiki.editform.save')}
          </Button>
        </div>
      </Form>
      <Suspense>
        {isBlocked ? (
          <CancelModal
            isOpen={isBlocked}
            onClose={handleClosePage}
            onCancel={() => blocker.proceed?.()}
            onReset={handleOnReset}
            isNewPage={!page}
          />
        ) : null}
      </Suspense>
    </div>
  );
};
