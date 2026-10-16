import { DocumentHelper, WorkspaceElement } from '@edifice.io/client';
import {
  MediaLibraryRef,
  MediaLibraryResult,
  useEdificeClient,
  useToast,
  useWorkspaceFile,
} from '@edifice.io/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';
import { usePagesAssistantActions } from '~/store/assistant';

// Owns PDF validation, import, polling, and media-library handlers for the card.
export const useAIImportPdfCard = () => {
  const { wikiId } = useParams();
  const { data: wiki } = useGetWiki(wikiId!);
  const navigate = useNavigate();
  const params = useParams();
  const toast = useToast();
  const { remove } = useWorkspaceFile();
  const mediaLibraryRef = useRef<MediaLibraryRef>(null);
  const { setPdfFileId } = usePagesAssistantActions();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  const handleImportButtonClick = () => {
    mediaLibraryRef.current?.show('attachment');
  };

  const handleMediaLibrarySuccess = async (result: MediaLibraryResult[]) => {
    // Validate the wiki and selected document before submitting an import.
    if (!wiki) {
      toast.error(
        t('wiki.assistant.ai.importpdf.error.wiki.undefined', { ns: appCode }),
      );
      return;
    }

    if (result?.length !== 1) {
      toast.error(
        t('wiki.assistant.ai.importpdf.error.unique.pdf', { ns: appCode }),
      );
      return;
    }

    const element: WorkspaceElement = result[0];
    if (!element?._id) {
      toast.error(
        t('wiki.assistant.ai.importpdf.error.pdf.notfound', { ns: appCode }),
      );
      return;
    }

    if (DocumentHelper.getRole(element) !== 'pdf') {
      toast.error(
        t('wiki.assistant.ai.importpdf.error.pdf.expected', { ns: appCode }),
      );
      return;
    }

    setPdfFileId(element.file!);
    navigate(`/id/${params.wikiId}/pages/assistant/ai/importPDFLoading`);
  };

  const handleMediaLibraryCancel = async (uploads?: WorkspaceElement[]) => {
    // Remove files uploaded during the cancelled media-library selection.
    if (uploads && uploads.length > 0) {
      await remove(uploads);
    }

    mediaLibraryRef.current?.hide();
  };

  return {
    mediaLibraryRef,
    handleImportButtonClick,
    handleMediaLibrarySuccess,
    handleMediaLibraryCancel,
  };
};
