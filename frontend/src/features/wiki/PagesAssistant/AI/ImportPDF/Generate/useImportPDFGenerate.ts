import { odeServices } from '@edifice.io/client';
import { useEdificeClient, useToast } from '@edifice.io/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { WikiDto } from '~/models';
import { assistantService } from '~/services/api/assistant/assistant.service';
import { AssistantImportPDFRequest } from '~/services/api/assistant/assistant.types';
import { usePagesAssistantActions, usePdfFileId } from '~/store/assistant';

export const useImportPDFGenerate = () => {
  const [structureLoading, setStructureLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const params = useParams();
  const { setPagesStructure } = usePagesAssistantActions();
  const pdfFileId = usePdfFileId();
  const toast = useToast();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const generate = async () => {
      setStructureLoading(true);

      const generateRequestPayload: AssistantImportPDFRequest = {
        fileId: pdfFileId,
        wikiId: params.wikiId!,
      };

      try {
        await assistantService.importPDF(generateRequestPayload);
      } catch (err: unknown) {
        let errorMessage: string = '';

        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err != null && 'error' in err) {
          errorMessage = String(err.error);
          if (errorMessage.includes('too_many_pages')) {
            errorMessage = t(
              'wiki.assistant.ai.importpdf.error.pdf.tooManyPages',
              { ns: appCode },
            );
          }
        } else if (typeof err === 'object' && err != null) {
          errorMessage = JSON.stringify(err);
        } else {
          errorMessage = String(err);
        }

        console.error(
          `${t('wiki.assistant.ai.importpdf.error', { ns: appCode })}: ${errorMessage}`,
        );
        toast.error(
          `${t('wiki.assistant.ai.importpdf.error', { ns: appCode })}: ${errorMessage}`,
          {
            isDismissible: true,
          },
        );
        navigate(`/id/${params.wikiId}/pages/assistant`);
        return;
      }

      intervalId = setInterval(async () => {
        const wikiResponse = await odeServices
          .http()
          .get<WikiDto>(`/wiki/${params.wikiId}`);

        if (wikiResponse.aiMetadata?.structureGenerated) {
          if (intervalId) clearInterval(intervalId);
          setStructureLoading(false);

          setPagesStructure(
            wikiResponse.pages.map((page) => ({ title: page.title })),
          );

          navigate(`/id/${params.wikiId}/pages/assistant/ai/importPDFResults`);
        }
      }, 3000);
    };

    generate();

    // Cleanup: stop interval when component unmounts
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return {
    structureLoading,
  };
};
