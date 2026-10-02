import {
  DocumentHelper,
  odeServices,
  WorkspaceElement,
} from '@edifice.io/client';
import {
  MediaLibraryRef,
  MediaLibraryResult,
  useToast,
  useWorkspaceFile,
} from '@edifice.io/react';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WikiDto } from '~/models';
import { useGetWiki } from '~/services';
import { assistantService } from '~/services/api/assistant/assistant.service';
import { usePagesAssistantActions } from '~/store/assistant';

const POLLING_DELAY_MS = 3000;

// Owns PDF validation, import, polling, and media-library handlers for the card.
export const usePagesAssistantImportPdfCard = () => {
  const { wikiId } = useParams();
  const { data: wiki } = useGetWiki(wikiId!);
  const { setPagesStructure } = usePagesAssistantActions();
  const navigate = useNavigate();
  const toast = useToast();
  const { remove } = useWorkspaceFile();
  const mediaLibraryRef = useRef<MediaLibraryRef>(null);
  // Holds the next scheduled poll so cleanup can cancel it without a render.
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Session version shared by import and polling requests to detect stale results.
  const pollingRunRef = useRef(0);

  const stopPolling = useCallback(() => {
    // Clearing a timer cannot cancel an HTTP request already in flight.
    // Incrementing the version makes those requests ignore their eventual results.
    pollingRunRef.current += 1;

    if (pollingTimerRef.current !== null) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Invalidate pending work on unmount or before switching to another wiki.
    return stopPolling;
  }, [wikiId, stopPolling]);

  const startPolling = (importedWikiId: string) => {
    // Replace the previous session and capture the version for this polling loop.
    stopPolling();
    const pollingRun = pollingRunRef.current;

    const poll = async () => {
      try {
        const wikiResponse = await odeServices
          .http()
          .get<WikiDto>(`/wiki/${importedWikiId}`);

        // Cleanup or a newer import may have invalidated this request while awaiting it.
        if (pollingRun !== pollingRunRef.current) return;

        if (wikiResponse.aiMetadata?.structureGenerated) {
          // Stop polling before publishing the generated structure and navigating.
          stopPolling();
          setPagesStructure(
            wikiResponse.pages.map((page) => ({ title: page.title })),
          );
          navigate(
            `/id/${importedWikiId}/pages/assistant/ai/step4StructureResult`,
          );
          return;
        }

        // Wait after the response before polling again, avoiding overlapping requests.
        pollingTimerRef.current = setTimeout(poll, POLLING_DELAY_MS);
      } catch {
        // Obsolete requests must not stop a newer session or display an error.
        if (pollingRun !== pollingRunRef.current) return;

        stopPolling();
        toast.error('Error while checking PDF import status');
      }
    };

    pollingTimerRef.current = setTimeout(poll, POLLING_DELAY_MS);
  };

  const handleImportButtonClick = () => {
    mediaLibraryRef.current?.show('attachment');
  };

  const handleMediaLibrarySuccess = async (result: MediaLibraryResult[]) => {
    // Validate the wiki and selected document before submitting an import.
    if (!wiki) {
      toast.error('Error while importing PDF: wiki is undefined');
      return;
    }

    if (result?.length !== 1) {
      toast.error('Please select exactly one PDF');
      return;
    }

    const element: WorkspaceElement = result[0];
    if (!element?._id) {
      toast.error('Error while importing PDF: imported document has no id');
      return;
    }

    if (DocumentHelper.getRole(element) !== 'pdf') {
      toast.error('File must be a PDF');
      return;
    }

    // Starting an import invalidates any previous import or polling session.
    stopPolling();
    const importRun = pollingRunRef.current;

    try {
      await assistantService.importPDF({
        fileId: element._id,
        wikiId: wiki._id,
      });

      // Do not restart polling if the component unmounted, the wiki changed,
      // or another import started while this request was pending.
      if (importRun !== pollingRunRef.current) return;

      mediaLibraryRef.current?.hide();
      startPolling(wiki._id);
    } catch {
      // Suppress errors from imports that no longer belong to the active session.
      if (importRun !== pollingRunRef.current) return;

      toast.error('Error while importing PDF');
    }
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
