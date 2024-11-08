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
import { useFormPage } from '~/hooks';
import { useCancelPage } from '~/hooks/useCancelPage';
import { Page } from '~/models';

export const FormPage = ({ page }: { page?: Page }) => {
  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);

  const {
    handleContentChange,
    register,
    handleSubmit,
    onSubmit,
    disableToggle,
    control,
    isSubmitting,
    isDirty,
    isValid,
    isManager,
    PAGE_LABEL,
    PAGE_PLACEHOLDER,
    PAGE_SAVE,
  } = useFormPage(page);

  const isToggleDisabled = disableToggle();

  const { handleOnButtonCancel, handleClosePage, isBlocked, blocker } =
    useCancelPage(isDirty, page);

  return (
    <div className="ms-lg-24 me-lg-16 mt-md-24">
      <Form id="pageForm" role="form" onSubmit={handleSubmit(onSubmit)}>
        <FormControl id="inputForm" isRequired>
          <Label>{t(PAGE_LABEL)}</Label>
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
            placeholder={t(PAGE_PLACEHOLDER)}
            autoFocus={true}
          ></Input>
        </FormControl>

        {isManager && (
          <FormControl id="toggleForm" className="d-flex mt-24 gap-8">
            <Controller
              control={control}
              name="isHidden"
              render={({ field: { onChange, value } }) => (
                <Toggle
                  disabled={isToggleDisabled}
                  onChange={onChange}
                  checked={value}
                />
              )}
            />

            <Label>{t('wiki.createform.toggle.title')}</Label>
            <Tooltip
              message={
                isToggleDisabled
                  ? t('wiki.createform.toggle.tooltip.disabled')
                  : t('wiki.createform.toggle.tooltip')
              }
              placement="bottom-start"
            >
              <InfoCircle className="c-pointer" height="18" />
            </Tooltip>
          </FormControl>
        )}

        <FormControl id="content" className="mt-16 page-content-editor">
          <Editor
            content={page?.content ?? ''}
            mode="edit"
            visibility="protected"
            onContentChange={handleContentChange}
            focus={null}
          ></Editor>
          <input type="hidden" {...register('content')} />
        </FormControl>

        <div className="d-flex align-items-center gap-8 justify-content-end mt-16 mb-24">
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
            {t(PAGE_SAVE)}
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
