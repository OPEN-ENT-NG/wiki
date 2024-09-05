import { EditorRef } from '@edifice-ui/editor';
import { useToggle } from '@uidotdev/usehooks';
import { useCallback, useRef, useState } from 'react';
import { useNavigation } from 'react-router-dom';
import { Page } from '~/models';

export const useFormPage = (page?: Page) => {
  const navigation = useNavigation();
  const editorRef = useRef<EditorRef>(null);

  const [content, setContent] = useState(page?.content ?? '');
  const [contentTitle, setContentTitle] = useState(page?.title ?? '');
  const [isVisible, toggle] = useToggle(page?.isVisible);
  const [isModified, setIsModified] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(true);

  const isSubmitting = navigation.state === 'submitting';

  const isModify = useCallback(() => {
    if (!page) return !!content || !!contentTitle || isVisible;
    return (
      page.content !== (editorRef.current?.getContent('html') as string) ||
      page.title !== contentTitle ||
      page.isVisible !== isVisible
    );
  }, [content, contentTitle, isVisible, page]);

  const updateModificationState = () => {
    if (isModify()) {
      setIsModified(true);
      setIsDisableButton(false);
    }
  };

  const handleOnTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContentTitle(event.target.value);
    updateModificationState();
  };

  const handleOnToggleChange = () => {
    toggle();
    updateModificationState();
  };

  const handleOnContentChange = ({ editor }: any) => {
    const htmlContent = editor.getHTML();
    setContent(htmlContent);
    updateModificationState();
  };

  const handleOnReset = () => {
    if (contentTitle.length > 0) {
      setIsModified(false);
    }
  };

  return {
    handleOnContentChange,
    handleOnToggleChange,
    handleOnTitleChange,
    handleOnReset,
    isDisableButton,
    isSubmitting,
    contentTitle,
    isModified,
    editorRef,
    isVisible,
    content,
  };
};
