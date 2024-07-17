import { Editor, EditorRef } from '@edifice-ui/editor';
import { InfoCircle, Save } from '@edifice-ui/icons';
import {
  Button,
  FormControl,
  Input,
  Label,
  Tooltip,
  useOdeClient,
} from '@edifice-ui/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  Form,
  redirect,
  useNavigate,
} from 'react-router-dom';
import { ButtonGroup } from '~/components/ButtonGroup';
import { Toggle } from '~/components/Toggle';
import { TTITLE_LENGTH_MAX } from '~/config/init-config';
import { wikiService } from '~/services';

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  //const toggle = formData.get('toggle') === 'on';

  const data = await wikiService.createPage({
    wikiId: params.wikiId!,
    data: {
      title,
      content,
    },
  });

  return redirect(`/id/${params.wikiId}/page/${data._id}`);
}

export const CreatePage = () => {
  const navigate = useNavigate();
  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);
  const editorRef = useRef<EditorRef>(null);
  const [content, setContent] = useState('');

  const handleCancel = () => {
    navigate(-1);
  };

  const handleContentChange = ({ editor }: any) => {
    const htmlContent = editor.getHTML();
    setContent(htmlContent);
  };

  return (
    <div className="mt-32">
      <Form method="post" role="form">
        <FormControl id="inputForm" isRequired className="mx-md-16">
          <Label>{t('wiki.linkerform.pagetitle.label')}</Label>
          <Input
            name="title"
            type="text"
            size="md"
            maxLength={TTITLE_LENGTH_MAX}
            placeholder={t('wiki.createform.input.placeholder')}
          ></Input>
        </FormControl>
        <FormControl id="toggleForm" className="mx-md-16 d-flex mt-24 gap-8">
          <Toggle name="toggle" />
          <Label>{t('wiki.createform.toggle.title')}</Label>
          <Tooltip
            message={t('wiki.createform.toggle.message')}
            placement="bottom-start"
          >
            <InfoCircle className="c-pointer" height="18" />
          </Tooltip>
        </FormControl>
        <div className="mx-md-16 mt-16 post-content-editor">
          <Editor
            ref={editorRef}
            content=""
            mode="edit"
            visibility="protected"
            onContentChange={handleContentChange}
          ></Editor>
          <input type="hidden" name="content" value={content} />
        </div>
        <ButtonGroup className="gap-8 mt-16 mx-md-16" variant="reverse">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            {t('wiki.editform.cancel')}
          </Button>
          <Button type="submit" variant="filled" leftIcon={<Save />}>
            {t('wiki.editform.save')}
          </Button>
        </ButtonGroup>
      </Form>
    </div>
  );
};
