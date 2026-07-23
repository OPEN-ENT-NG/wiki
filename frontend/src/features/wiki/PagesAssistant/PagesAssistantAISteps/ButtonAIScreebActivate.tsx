import { useEdificeClient, useScreeb } from '@edifice.io/react';
import { IconArrowRight } from '@edifice.io/react/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { usePagesAssistantActions } from '~/store/assistant';
import AIButton from '~/components/AIButton/AIButton';
import { WikiDto } from '~/models';
import { wikiQueryOptions } from '~/services';

export const ButtonAIScreebActivate = ({
  generatedWiki,
}: {
  generatedWiki: WikiDto;
}) => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const { setFormValues } = usePagesAssistantActions();
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { triggerSurvey } = useScreeb();

  const handleGoToWiki = async () => {
    if (!params.wikiId) {
      return;
    }

    setFormValues({ level: '', subject: '', sequence: '', keywords: '' });

    const surveyHooks = {
      version: '1.0.0',
      onSurveyCompleted: (payload: unknown) =>
        console.log('responses:', payload),
      onSurveyHidden: (payload: unknown) => console.log('dismissed:', payload),
    } as any;

    window.setTimeout(() => {
      triggerSurvey('d4872bb4-7901-4a4f-8cee-4eb7872ad822', surveyHooks);
    }, 30_000);

    // force query invalidation and fetch again before navigating to the wiki page
    await queryClient.invalidateQueries({
      queryKey: wikiQueryOptions.findOne(params.wikiId).queryKey,
    });
    await queryClient.fetchQuery(wikiQueryOptions.findOne(params.wikiId));

    if (generatedWiki?.pages?.length) {
      navigate(`/id/${params.wikiId}/page/${generatedWiki.pages[0]._id}`);
    } else {
      navigate(`/id/${params.wikiId}`);
    }
  };

  return (
    <AIButton
      onClick={handleGoToWiki}
      rightIcon={<IconArrowRight color="#ECBE30" />}
    >
      {t('wiki.assistant.ai.step4.structure.result.wait.button.finished', {
        ns: appCode,
      })}
    </AIButton>
  );
};
