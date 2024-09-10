import { EditorRef } from '@edifice-ui/editor';
import { useToggle } from '@uidotdev/usehooks';
import { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigation, useParams } from 'react-router-dom';
import { Page } from '~/models';
import { useGetWiki } from '~/services';

export const useFormPage = (page?: Page) => {
  const navigation = useNavigation();
  const location = useLocation();
  const editorRef = useRef<EditorRef>(null);
  const params = useParams();
  const { data: wikiData } = useGetWiki(params.wikiId!);

  const isSubPage: boolean =
    location.pathname.includes('subpage') || !!page?.parentId;
  const editionMode = !!page?._id;

  /**
   * Return visibility toggle default value.
   */
  const getDefaultVisibleValue = useCallback(() => {
    // In edition mode, return current page visibility
    if (editionMode) {
      return page?.isVisible;
    }
    // In subpage creation mode, visibility must be the same as parent page visibility
    if (isSubPage) {
      const parentPage = wikiData?.pages.find(
        (page) => page._id === params.pageId
      );
      return parentPage?.isVisible;
    }
    // In regular creation mode, visibility is true by default
    return true;
  }, [page, params.wikiId]);

  const [content, setContent] = useState(page?.content ?? '');
  const [contentTitle, setContentTitle] = useState(page?.title ?? '');
  const [isVisible, toggle] = useToggle(getDefaultVisibleValue());
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

  const disableToggle = useCallback(() => {
    if (isSubPage) {
      const parentPage = wikiData?.pages.find(
        (page) => page._id === params.pageId
      );
      if (!parentPage?.isVisible) {
        return true;
      }
    }
    return false;
  }, [isSubPage]);

  return {
    handleOnContentChange,
    handleOnToggleChange,
    handleOnTitleChange,
    handleOnReset,
    disableToggle,
    isDisableButton,
    isSubmitting,
    contentTitle,
    isModified,
    editorRef,
    isVisible,
    content,
  };
};
