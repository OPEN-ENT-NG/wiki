import {
  Button,
  Flex,
  Grid,
  RadioCard,
  Stepper,
  useEdificeClient,
} from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { AIRenderPlanPreview } from './AIRenderPreviews/AIRenderPlanPreview';
import { useState } from 'react';
import { AIRenderTracePreview } from './AIRenderPreviews/AIRenderTracePreview';
import { AIRenderMixPreview } from './AIRenderPreviews/AIRenderMixPreview';
import './AIChooseRender.css';
import { IconRafterRight } from '@edifice.io/react/icons';
import { useNavigate, useParams } from 'react-router-dom';

export type RenderType = 'plan' | 'trace' | 'mix';

export const AIChooseRender = () => {
  const [type, setType] = useState<RenderType>('plan');
  const params = useParams();
  const navigate = useNavigate();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

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
      case 'mix':
        break;
      default:
        break;
    }
  };

  return (
    <Grid>
      <Grid.Col sm="4" md="5" lg="5" xl="7">
        <div className="pages-assistant-ai-wrapper ai-choose-render border">
          <div>
            <h2 className="mt-16 ai-choose-render__title">
              {t('wiki.assistant.ai.choose.render.title', { ns: appCode })}
            </h2>
            <p className="text-gray-700 ai-choose-render__description">
              {t('wiki.assistant.ai.choose.render.description', {
                ns: appCode,
              })}
            </p>
            <Stepper currentStep={0} nbSteps={4} />
            <div className="ai-choose-render__question">
              {t('wiki.assistant.ai.choose.render.question', { ns: appCode })}
            </div>
            <div className="ai-choose-render__radios">
              <RadioCard
                selectedValue={type}
                value="plan"
                model={type}
                label={t('wiki.assistant.ai.choose.render.radio.plan')}
                onChange={() => {
                  setType('plan');
                }}
              ></RadioCard>
              <RadioCard
                selectedValue={type}
                value="trace"
                model={type}
                label={t('wiki.assistant.ai.choose.render.radio.trace')}
                onChange={() => {
                  setType('trace');
                }}
              ></RadioCard>
              <RadioCard
                selectedValue={type}
                value="mix"
                model={type}
                label={t('wiki.assistant.ai.choose.render.radio.mix')}
                onChange={() => {
                  setType('mix');
                }}
              ></RadioCard>
              <Flex>
                <Button
                  variant="ghost"
                  color="tertiary"
                  onClick={handleCancelButton}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="filled"
                  color="primary"
                  rightIcon={<IconRafterRight />}
                  onClick={handleNextButton}
                >
                  {t('next')}
                </Button>
              </Flex>
            </div>
          </div>
        </div>
      </Grid.Col>
      <Grid.Col sm="4" md="3" lg="3" xl="5">
        <div className="ai-choose-render__preview">
          {type === 'plan' && <AIRenderPlanPreview />}
          {type === 'trace' && <AIRenderTracePreview />}
          {type === 'mix' && <AIRenderMixPreview />}
        </div>
      </Grid.Col>
    </Grid>
  );
};
