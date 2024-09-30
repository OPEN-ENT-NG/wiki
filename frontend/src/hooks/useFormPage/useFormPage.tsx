import { EditorRef } from '@edifice-ui/editor';
import { useToggle } from '@uidotdev/usehooks';
import { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigation, useParams } from 'react-router-dom';
import { Page } from '~/models';
import { useGetWiki } from '~/services';
import { findPage } from '~/utils/findPage';

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
    let isVisible: boolean | undefined = false;

    // In edition mode, return current page visibility
    if (editionMode) {
      isVisible = page?.isVisible;
    } else if (isSubPage) {
      // In subpage creation mode, visibility must be the same as parent page visibility
      const parentPage = findPage(wikiData!, params.pageId!);
      isVisible = parentPage?.isVisible;
    } else {
      // In page creation mode, visibility is true by default
      isVisible = true;
    }

    return isVisible;
  }, [page, params, editionMode, isSubPage, wikiData]);

  const [content, setContent] = useState(page?.content ?? '');
  const [contentTitle, setContentTitle] = useState(page?.title ?? '');
  const [isVisible, toggle] = useToggle(getDefaultVisibleValue());
  const [isModified, setIsModified] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(true);

  const isSubmitting = navigation.state === 'submitting';

  const isModify = useCallback(() => {
    if (!page) return !!content || !!contentTitle;
    if (content) {
      return (
        page.content !== content ||
        page.title !== contentTitle ||
        page.isVisible !== isVisible
      );
    }
    return false;
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
      const parentPageId: string | undefined = editionMode
        ? page.parentId
        : params.pageId;
      const parentPage = findPage(wikiData!, parentPageId!);
      return !parentPage?.isVisible;
    }

    return false;
  }, [editionMode, isSubPage, wikiData, page, params]);

  return {
    handleOnContentChange,
    handleOnToggleChange,
    handleOnTitleChange,
    handleOnReset,
    disableToggle,
    getDefaultVisibleValue,
    isDisableButton,
    isSubmitting,
    contentTitle,
    isModified,
    editorRef,
    isVisible,
    content,
    isSubPage,
  };
};
