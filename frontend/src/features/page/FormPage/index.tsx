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
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router-dom';
import { CancelModal } from '~/components/CancelModal';
import { Toggle } from '~/components/Toggle';
import { MAX_TITLE_LENGTH } from '~/config';
import { useCancelPage } from '~/hooks/useCancelPage';
import { useFormPage } from '~/hooks/useFormPage';
import { Page } from '~/models';

export const FormPage = ({ page }: { page?: Page }) => {
  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);

  const {
    handleEditorChange,
    register,
    handleSubmit,
    onSubmit,
    disableToggle,
    editorRef,
    control,
    isSubmitting,
    isDirty,
    isValid,
    label,
    placeholder,
    save,
  } = useFormPage(page);

  const { handleOnButtonCancel, handleClosePage, isBlocked, blocker } =
    useCancelPage(isDirty, page);

  return (
    <div className="ms-16 ms-lg-24 me-16 mt-24">
      <Form id="pageForm" role="form" onSubmit={handleSubmit(onSubmit)}>
        <FormControl id="inputForm" isRequired>
          <Label>{t(label)}</Label>
          <Input
            type="text"
            {...register('title', {
              required: true,
              maxLength: MAX_TITLE_LENGTH,
              pattern: {
                value: /[^ ]/,
                message: 'invalid title',
              },
            })}
            size="md"
            maxLength={MAX_TITLE_LENGTH}
            placeholder={t(placeholder)}
            autoFocus={true}
          ></Input>
        </FormControl>

        <FormControl id="toggleForm" className="d-flex mt-24 gap-8">
          <Controller
            control={control}
            name="isVisible"
            render={({ field: { onChange, value } }) => (
              <Toggle
                disabled={disableToggle()}
                onChange={onChange}
                checked={value}
              />
            )}
          />

          <Label>{t('wiki.createform.toggle.title')}</Label>
          <Tooltip
            message={t('wiki.createform.toggle.message')}
            placement="bottom-start"
          >
            <InfoCircle className="c-pointer" height="18" />
          </Tooltip>
        </FormControl>

        <FormControl id="content" className="mt-16 page-content-editor">
          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <Editor
                ref={editorRef}
                content={value}
                mode="edit"
                visibility="protected"
                onContentChange={({ editor }: any) =>
                  handleEditorChange({ editor }, onChange)
                }
                focus={null}
              ></Editor>
            )}
          />
        </FormControl>
        <div className="d-flex align-items-center gap-8 justify-content-end mt-16">
          <Button type="button" variant="ghost" onClick={handleOnButtonCancel}>
            {t('wiki.editform.cancel')}
          </Button>
          <Button
            type="submit"
            variant="filled"
            leftIcon={<Save />}
            isLoading={isSubmitting}
            disabled={isSubmitting || !isDirty || !isValid}
          >
            {t(save)}
          </Button>
        </div>
      </Form>
      <Suspense>
        {isBlocked ? (
          <CancelModal
            isOpen={isBlocked}
            onClose={handleClosePage}
            onCancel={() => blocker.proceed?.()}
            isNewPage={!page}
          />
        ) : null}
      </Suspense>
    </div>
  );
};
