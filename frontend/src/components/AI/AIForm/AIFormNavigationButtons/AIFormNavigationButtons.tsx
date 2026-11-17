import { Button, Flex, useEdificeClient } from '@edifice.io/react';
import { IconRafterLeft, IconRafterRight } from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import './AIFormNavigationButtons.css';

const AIFormNavigationButtons = ({
  handlePreviousClick,
}: {
  handlePreviousClick: () => void;
}) => {
  const { formState } = useFormContext();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <>
      <Flex className="ai-form-navigation" justify="end">
        <Button
          data-testid="ai-form-navigation-back"
          variant="ghost"
          color="tertiary"
          leftIcon={<IconRafterLeft />}
          onClick={handlePreviousClick}
        >
          {t('previous')}
        </Button>
        <Button
          data-testid="ai-form-navigation-next"
          type="submit"
          rightIcon={<IconRafterRight />}
          disabled={!formState.isValid}
        >
          {t('next')}
        </Button>
      </Flex>
    </>
  );
};

export default AIFormNavigationButtons;
