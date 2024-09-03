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
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigate, useNavigation } from 'react-router-dom';
import { Toggle } from '~/components/Toggle';
import { MAX_TITLE_LENGTH } from '~/config/init-config';
import { Page } from '~/models';

export const FormPage = ({ page }: { page?: Page }) => {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const editorRef = useRef<EditorRef>(null);

  const [content, setContent] = useState('');
  const [contentTitle, setContentTitle] = useState(page?.title ?? '');
  const [isVisible, toggle] = useToggle(page?.isVisible);

  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);

  const handleOnButtonCancel = () => {
    navigate(-1);
  };

  const handleOnContentChange = ({ editor }: any) => {
    const htmlContent = editor.getHTML();
    setContent(htmlContent);
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggle();
  };

  return (
    <div className="ms-16 ms-lg-24 me-16 mt-24">
      <Form method="post" role="form">
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
            disabled={contentTitle.length === 0}
            leftIcon={<Save />}
            isLoading={navigation.state === 'submitting'}
          >
            {t('wiki.editform.save')}
          </Button>
        </div>
      </Form>
    </div>
  );
};
