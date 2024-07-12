import { Plus } from '@edifice-ui/icons';
import { Button, useOdeClient } from '@edifice-ui/react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const NewPage = () => {
  const navigate = useNavigate();

  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  const handleCreatePage = () => {
    navigate(`page/create`);
  };

  return (
    <div className="d-grid my-16">
      <Button variant="outline" onClick={handleCreatePage} leftIcon={<Plus />}>
        {t('wiki.create.new.page', { ns: appCode })}
      </Button>
    </div>
  );
};
