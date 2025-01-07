import {
  Button,
  FormControl,
  Input,
  Label,
  Tooltip,
  useEdificeClient,
} from '@edifice.io/react';
import { Editor } from '@edifice.io/react/editor';
import { IconInfoCircle, IconSave } from '@edifice.io/react/icons';
import { Suspense } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, useNavigation } from 'react-router-dom';
import { ButtonGroup } from '~/components/ButtonGroup';
import { CancelModal } from '~/components/CancelModal';
import { Toggle } from '~/components/Toggle';
import { MAX_TITLE_LENGTH } from '~/config';
import { useFormPage } from '~/hooks';
import { useCancelPage } from '~/hooks/useCancelPage';
import { Page } from '~/models';

export const FormPage = ({ page }: { page?: Page }) => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  // fix #WB2-2155: using useNagivation hook from react-router-dom to know the form submitting state
  // because react-router-dom submit function does not wait for router action to finish
  // so the react-hook-form is not able to handle form state properly
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const {
    handleContentChange,
    register,
    watch,
    handleSubmit,
    onSubmit,
    disableToggle,
    control,
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
          <p className="small text-gray-700 p-2 text-end">
            {`${watch('title', '').length || 0} / ${MAX_TITLE_LENGTH}`}
          </p>
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
              <IconInfoCircle className="c-pointer" height="18" />
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
          />
          <input type="hidden" {...register('content')} />
        </FormControl>

        <ButtonGroup
          className={`d-flex align-items-center gap-8 justify-content-end mt-16 mb-24 px-24 z-0 bg-white ${page && 'sticky-bottom py-8'}`}
        >
          <Button type="button" variant="ghost" onClick={handleOnButtonCancel}>
            {t('wiki.editform.cancel')}
          </Button>
          <Button
            type="submit"
            variant="filled"
            leftIcon={<IconSave />}
            isLoading={isSubmitting}
            disabled={isSubmitting || !isDirty || !isValid}
          >
            {t(PAGE_SAVE)}
          </Button>
        </ButtonGroup>
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
