import { odeServices } from '@edifice.io/client';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WikiDto } from '~/models';
import { usePagesStructureStore } from '~/store/assistant/importPDF/importPDFStore';

export const useImportPDFResults = () => {
  const [contentFinished, setContentFinished] = useState(false);
  const [generatedWiki, setGeneratedWiki] = useState<WikiDto>();
  const pagesStructure = usePagesStructureStore();
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const wikiResponse = await odeServices
        .http()
        .get<WikiDto>(`/wiki/${params.wikiId}`);

      if (wikiResponse.aiMetadata?.contentGenerated) {
        clearInterval(intervalId);
        setContentFinished(true);
        setGeneratedWiki(wikiResponse);
      }
    }, 5000);

    // Cleanup: stop interval when component unmounts
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [params.wikiId]);

  const handleCancelButtonClick = () => {
    navigate(`/id/${params.wikiId}/pages/assistant`);
  };

  return {
    pagesStructure,
    contentFinished,
    generatedWiki,
    handleCancelButtonClick,
  };
};
