import { Editor, EditorRef } from '@edifice-ui/editor';
import { InfoCircle, Save } from '@edifice-ui/icons';
import {
  Button,
  FormControl,
  Input,
  Label,
  Tooltip,
  useOdeClient,
  useToggle,
} from '@edifice-ui/react';
import { Suspense, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigate, useNavigation, useParams } from 'react-router-dom';
import { CancelModal } from '~/components/CancelModal';
import { Toggle } from '~/components/Toggle';
import { MAX_TITLE_LENGTH } from '~/config/init-config';
import { useBlockerPage } from '~/hooks/useBlockerPage';
import { Page } from '~/models';

const isSubmitting = 'submitting';

export const FormPage = ({ page }: { page?: Page }) => {
  const params = useParams();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const editorRef = useRef<EditorRef>(null);

  const [content, setContent] = useState(page?.content ?? '');
  const [contentTitle, setContentTitle] = useState(page?.title ?? '');
  const [isVisible, toggle] = useToggle(page?.isVisible);
  const [isModified, setIsModified] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(true);

  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);
  const blocker = useBlockerPage(isModified);

  const handleOnButtonCancel = () => {
    if (isModify()) {
      if (page) {
        navigate(`/id/${params.wikiId}/page/${page._id}`);
      } else {
        navigate(`/id/${params.wikiId}`);
      }
    } else {
      navigate('..');
    }
  };

  const updateModificationState = () => {
    if (isModify()) {
      setIsModified(true);
      setIsDisableButton(false);
    }
  };

  const handleOnContentChange = ({ editor }: any) => {
    const htmlContent = editor.getHTML();
    setContent(htmlContent);
    updateModificationState();
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContentTitle(event.target.value);
    updateModificationState();
  };

  const handleToggle = () => {
    toggle();
    updateModificationState();
  };

  const isModify = useCallback(() => {
    if (!page) return !!content || !!contentTitle || isVisible;
    return (
      page.content !== (editorRef.current?.getContent('html') as string) ||
      page.title !== contentTitle ||
      page.isVisible !== isVisible
    );
  }, [content, contentTitle, isVisible, page]);

  const handleClosePage = () => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const resetModify = () => {
    if (contentTitle.length > 0) {
      setIsModified(false);
    }
  };

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
            onChange={(event) => setContentTitle(event.target.value)}
            autoFocus={true}
          ></Input>
        </FormControl>
        <FormControl id="toggleForm" className="d-flex mt-24 gap-8">
          <Toggle
            name="isVisible"
            checked={isVisible}
            onChange={handleToggle}
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
            isLoading={navigation.state === isSubmitting}
            disabled={isDisableButton}
            onClick={resetModify}
          >
            {t('wiki.editform.save')}
          </Button>
        </div>
      </Form>
      <Suspense>
        {blocker.state === 'blocked' ? (
          <CancelModal
            isOpen={blocker.state === 'blocked'}
            onClose={handleClosePage}
            onCancel={() => blocker.proceed?.()}
            onReset={resetModify}
            isNewPage={!page}
          />
        ) : null}
      </Suspense>
    </div>
  );
};
