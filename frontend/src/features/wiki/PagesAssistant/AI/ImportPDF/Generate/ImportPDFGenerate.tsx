import { Flex, Stepper, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { IconClock } from '@edifice.io/react/icons';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../../../../animations/AILoading.json';
import { useImportPDFGenerate } from './useImportPDFGenerate';

export const ImportPDFGenerate = () => {
  const { structureLoading } = useImportPDFGenerate();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  return (
    <Flex justify="center">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="my-24">
          {structureLoading && (
            <div>
              <Stepper currentStep={1} nbSteps={3} />
              <h2 className="mt-16">
                {t('wiki.assistant.ai.importpdf.generate.title', {
                  ns: appCode,
                })}
              </h2>
              <div className="text-center">
                <Flex justify="center" align="center">
                  <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    style={{ width: 250 }}
                  />
                </Flex>
                <h3 className="mt-16">
                  {t('wiki.assistant.ai.importpdf.generate.description', {
                    ns: appCode,
                  })}
                </h3>
                <Flex justify="center" className="text-gray-700 mt-8" gap="4">
                  <IconClock />
                  {t('wiki.assistant.ai.importpdf.generate.subtitle', {
                    ns: appCode,
                  })}
                </Flex>
              </div>
            </div>
          )}
        </div>
      </div>
    </Flex>
  );
};
