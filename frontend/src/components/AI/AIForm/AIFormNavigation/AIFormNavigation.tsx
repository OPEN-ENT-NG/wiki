import { Button, Flex } from '@edifice.io/react';
import {
  IconAiFill,
  IconRafterLeft,
  IconRafterRight,
} from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import './AIFormNavigation.css';
import AIButton from '../../AIButton/AIButton';

const AIFormNavigation = ({
  isFirstStep = false,
  isFinalStep = false,
  handlePreviousClick,
}: {
  isFirstStep?: boolean;
  isFinalStep?: boolean;
  handlePreviousClick: () => void;
}) => {
  const { formState } = useFormContext();

  const { t } = useTranslation();

  return (
    <>
      <Flex className="ai-form-navigation" justify="end">
        {!isFirstStep && (
          <Button
            data-testid="ai-form-navigation-back"
            variant="ghost"
            color="tertiary"
            leftIcon={<IconRafterLeft />}
            onClick={handlePreviousClick}
          >
            {t('previous')}
          </Button>
        )}
        {!isFinalStep && (
          <Button
            data-testid="ai-form-navigation-next"
            type="submit"
            rightIcon={<IconRafterRight />}
            disabled={!formState.isValid}
          >
            {t('next')}
          </Button>
        )}
        {isFinalStep && (
          <AIButton type="submit" leftIcon={<IconAiFill color="#C232AA" />}>
            {t('wiki.assistant.ai.form.generate', 'Générer la séquence')}
          </AIButton>
        )}
      </Flex>
    </>
  );
};

export default AIFormNavigation;
