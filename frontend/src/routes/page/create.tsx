import { InfoCircle, Save } from '@edifice-ui/icons';
import {
  Button,
  FormControl,
  Input,
  Label,
  Tooltip,
  useToggle,
} from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';
import { ActionFunctionArgs, redirect, useNavigate } from 'react-router-dom';
import { ButtonGroup } from '~/components/ButtonGroup';
import { Toggle } from '~/components/Toggle';
import { wikiService } from '~/services/api';

export async function action({ params }: ActionFunctionArgs) {
  const content = 'test';

  const data = await wikiService.createPage({
    wikiId: params.wikiId!,
    data: {
      title: "page d'accueil",
      content,
    },
  });

  return redirect(`/id/${params.wikiId}/page/${params}/${data._id}`);
}

export const CreatePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('wiki');
  const [state, toggle] = useToggle(false);

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="mt-32">
      <FormControl id="" isRequired className="mx-md-16">
        <Label>{t('wiki.linkerform.pagetitle.label')}</Label>
        <Input
          type="text"
          size="md"
          placeholder={t('wiki.createform.input.placeholder')}
        ></Input>
      </FormControl>
      <FormControl id="" className="mx-md-16 d-flex mt-16 gap-8">
        <Toggle onChange={toggle} />
        <Label>{t('wiki.createform.toggle.title')}</Label>
        <Tooltip
          message={t('wiki.createform.toggle.message')}
          placement="bottom-start"
        >
          <InfoCircle className="c-pointer" height="18" />
        </Tooltip>
      </FormControl>
      <div className="mx-md-16">{/* Editor */}</div>
      <ButtonGroup className="gap-8 mt-16 mx-md-16" variant="reverse">
        <Button type="button" variant="ghost" onClick={handleCancel}>
          {t('wiki.editform.cancel')}
        </Button>
        <Button type="button" variant="filled" leftIcon={<Save />}>
          {t('wiki.editform.save')}
        </Button>
      </ButtonGroup>
    </div>
  );
};
