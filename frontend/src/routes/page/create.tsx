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
import { QueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  Form,
  redirect,
  useNavigate,
} from 'react-router-dom';
import { Toggle } from '~/components/Toggle';
import { MAX_TITLE_LENGTH } from '~/config/init-config';
import { wikiQueryOptions, wikiService } from '~/services';

export const action =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
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

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

    return redirect(`/id/${params.wikiId}/page/${data._id}`);
  };

export const CreatePage = () => {
  const navigate = useNavigate();
  const editorRef = useRef<EditorRef>(null);

  const [content, setContent] = useState('');

  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);

  const handleOnButtonCancel = () => {
    navigate(-1);
  };

  const handleOnContentChange = ({ editor }: any) => {
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
            maxLength={MAX_TITLE_LENGTH}
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
        <div className="mx-md-16 mt-16 post-content-editor`">
          <Editor
            ref={editorRef}
            content=""
            mode="edit"
            visibility="protected"
            onContentChange={handleOnContentChange}
          ></Editor>
          <input type="hidden" name="content" value={content} />
        </div>
        <div className="d-flex align-items-center gap-8 justify-content-end mt-16">
          <Button type="button" variant="ghost" onClick={handleOnButtonCancel}>
            {t('wiki.editform.cancel')}
          </Button>
          <Button type="submit" variant="filled" leftIcon={<Save />}>
            {t('wiki.editform.save')}
          </Button>
        </div>
      </Form>
    </div>
  );
};
