import {
  Button,
  Flex,
  Grid,
  RadioCard,
  useEdificeClient,
} from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { AIRenderPlanPreview } from './AIRenderPreviews/AIRenderPlanPreview';
import { useState } from 'react';
import { AIRenderTracePreview } from './AIRenderPreviews/AIRenderTracePreview';
import './AIChooseRender.css';
import { IconRafterRight } from '@edifice.io/react/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { AIStepLayout } from '~/components/AI/AIStepLayout/AIStepLayout';
import { AIStepHeader } from '~/components/AI/AIStepHeader/AIStepHeader';

export type RenderType = 'plan' | 'trace';

export const AIChooseRender = () => {
  const [type, setType] = useState<RenderType>('plan');
  const params = useParams();
  const navigate = useNavigate();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);
  const { t: tPortal } = useTranslation();

  const handleCancelButton = () => {
    navigate(`/id/${params.wikiId}/pages/assistant`);
  };

  const handleNextButton = () => {
    console.log(type);
    switch (type) {
      case 'plan':
        navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/plan/step1`);
        break;
      case 'trace':
        navigate(
          `/id/${params.wikiId}/pages/assistant/ai/creation/trace/step1`,
        );
        break;
      default:
        break;
    }
  };

  return (
    <AIStepLayout>
      <Grid className="ai-choose-render">
        {/* Render Choice Radios */}
        <Grid.Col sm="5" xl="7">
          <AIStepHeader
            title={t(
              'wiki.assistant.ai.choose.render.title',
              'Création assistée',
            )}
            description={t(
              'wiki.assistant.ai.choose.render.description',
              'Choisissez ce que vous souhaitez générer',
            )}
            currentStep={0}
            nbSteps={4}
          />
          <div className="ai-choose-render__question">
            {t(
              'wiki.assistant.ai.choose.render.question',
              'Quel type de rendu souhaitez-vous ?',
            )}
          </div>
          <Flex direction="column" className="ai-choose-render__radios" fill>
            <RadioCard
              selectedValue={type}
              value="plan"
              model={type}
              label={t(
                'wiki.assistant.ai.choose.render.radio.plan.label',
                'Plan de séquence pour l’enseignant',
              )}
              description={t(
                'wiki.assistant.ai.choose.render.radio.plan.description',
                'Le déroulé pour conduire la séquence.',
              )}
              onChange={() => {
                setType('plan');
              }}
            ></RadioCard>
            <RadioCard
              selectedValue={type}
              value="trace"
              model={type}
              label={t(
                'wiki.assistant.ai.choose.render.radio.trace.label',
                'Traces écrites pour les élèves',
              )}
              description={t(
                'wiki.assistant.ai.choose.render.radio.trace.description',
                'Ce que l’élève consulte, retient, révise.',
              )}
              onChange={() => {
                setType('trace');
              }}
            ></RadioCard>
            <Flex justify="end" className="ai-choose-render__navigation">
              <Button
                variant="ghost"
                color="tertiary"
                onClick={handleCancelButton}
              >
                {tPortal('cancel')}
              </Button>
              <Button
                variant="filled"
                color="primary"
                rightIcon={<IconRafterRight />}
                onClick={handleNextButton}
              >
                {tPortal('next')}
              </Button>
            </Flex>
          </Flex>
        </Grid.Col>

        {/* Render Previews */}
        <Grid.Col sm="3" xl="5">
          <div className="ai-choose-render__preview">
            {type === 'plan' && <AIRenderPlanPreview />}
            {type === 'trace' && <AIRenderTracePreview />}
          </div>
        </Grid.Col>
      </Grid>
    </AIStepLayout>
  );
};
