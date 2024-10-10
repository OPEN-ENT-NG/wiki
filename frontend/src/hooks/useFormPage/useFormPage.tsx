import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useParams, useSubmit } from 'react-router-dom';
import { Page } from '~/models';
import { useGetWiki } from '~/services';
import { findPage } from '~/utils/findPage';

export type FormPageDataProps = {
  title: string;
  isHidden: boolean;
  content: string;
};

export const useFormPage = (page?: Page) => {
  const [content, setContent] = useState(page?.content);

  const location = useLocation();
  const params = useParams();
  const submit = useSubmit();

  const { data: wikiData } = useGetWiki(params.wikiId!);

  const isSubPage: boolean =
    location.pathname.includes('subpage') || !!page?.parentId;

  const editionMode = !!page?._id;

  /**
   * Return hidden toggle default value.
   */
  const getDefaultHiddenToggleValue = useCallback(() => {
    let isHidden: boolean | undefined = false;

    // In edition mode, return current page visibility
    if (editionMode) {
      isHidden = !page?.isVisible;
    } else if (isSubPage) {
      // In subpage creation mode, visibility must be the same as parent page visibility
      const parentPage = findPage(wikiData!, params.pageId!);
      isHidden = !parentPage?.isVisible;
    } else {
      // In page creation mode, hidden is false by default
      isHidden = false;
    }

    return isHidden;
  }, [page, params, editionMode, isSubPage, wikiData]);

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid },
  } = useForm<FormPageDataProps>({
    defaultValues: {
      title: page?.title,
      isHidden: getDefaultHiddenToggleValue(),
      content: page?.content,
    },
  });

  useEffect(() => {
    setValue('content', content ?? '', { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

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

  const handleContentChange = ({ editor }: any) => {
    const updatedContent = editor.getHTML();
    setContent(updatedContent);
  };

  const onSubmit = (data: any) => {
    submit(data, {
      method: 'post',
    });
  };

  const PAGE_LABEL = isSubPage
    ? 'wiki.createform.subpage.label'
    : 'wiki.createform.page.label';

  const PAGE_PLACEHOLDER = isSubPage
    ? 'wiki.createform.subpage.placeholder'
    : 'wiki.createform.page.placeholder';

  const PAGE_SAVE = isSubPage
    ? 'wiki.createform.subpage.save'
    : 'wiki.createform.page.save';

  return {
    register,
    handleContentChange,
    handleSubmit,
    onSubmit,
    disableToggle,
    getDefaultHiddenToggleValue,
    control,
    isSubmitting,
    isDirty,
    isValid,
    PAGE_LABEL,
    PAGE_PLACEHOLDER,
    PAGE_SAVE,
  };
};
