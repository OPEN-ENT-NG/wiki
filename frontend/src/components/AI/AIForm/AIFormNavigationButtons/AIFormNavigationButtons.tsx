import { Button, Flex, useEdificeClient } from '@edifice.io/react';
import { IconRafterLeft, IconRafterRight } from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

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
      <div>isValid: {formState.isValid.toString()}</div>
      <Flex className="mt-24" justify="end">
        <Button
          variant="ghost"
          color="tertiary"
          leftIcon={<IconRafterLeft />}
          onClick={handlePreviousClick}
        >
          {t('previous')}
        </Button>
        <Button
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
