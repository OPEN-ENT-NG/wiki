import { Button, useEdificeClient } from '@edifice.io/react';
import { IconPlus } from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';

export const NewPage = () => {
  const navigate = useNavigate();
  const match = useMatch('/id/:wikiId/page/create');

  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  const handleCreatePage = () => {
    navigate(`page/create`);
  };

  return (
    <div className="d-grid my-16">
      <Button
        variant="outline"
        onClick={handleCreatePage}
        leftIcon={<IconPlus />}
        disabled={!!match}
      >
        {t('wiki.create.new.page', { ns: appCode })}
      </Button>
    </div>
  );
};
