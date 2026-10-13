import { H5PRenderer, useH5PEditorModal } from '@edifice.io/h5p-frontend/lib';
import '@edifice.io/h5p-frontend/lib/style.css';
import { H5PNodeView } from '@edifice.io/react/editor';
import { useMemo } from 'react';

/** Read-only H5P node: renders activities, no editor entry point. */
const readExtensions = [H5PNodeView(H5PRenderer)];

/**
 * H5P activities in wiki pages (edifice-h5p, docs/architecture-cible.md §9).
 * Opt-in per editor, like the conversation history in the messaging app, so that H5P
 * does not appear in other applications using the same editor.
 */
export function useH5PExtensions(mode: 'edit' | 'read') {
  const h5p = useH5PEditorModal();

  const editExtensions = useMemo(
    () => [H5PNodeView(H5PRenderer).configure({ onRequestEdit: h5p.open })],
    [h5p.open],
  );

  return mode === 'edit'
    ? { extensions: editExtensions, modal: h5p.modal }
    : { extensions: readExtensions, modal: null };
}
