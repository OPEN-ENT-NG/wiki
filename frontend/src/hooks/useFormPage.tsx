import { EditorRef } from '@edifice-ui/editor';
import { useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useParams, useSubmit } from 'react-router-dom';
import { Page } from '~/models';
import { useGetWiki } from '~/services';
import { findPage } from '~/utils/findPage';

export type FormPageDataProps = {
  title: string;
  isVisible: boolean;
  content: string;
};

export const useFormPage = (page?: Page) => {
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

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid },
  } = useForm<FormPageDataProps>({
    defaultValues: {
      title: page?.title,
      isVisible: getDefaultVisibleValue(),
      content: page?.content,
    },
  });

  const submit = useSubmit();

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

  const handleEditorChange = (
    { editor }: any,
    onChange: (...event: any[]) => void
  ) => {
    const updatedContent = editor.getHTML();
    onChange(updatedContent);
  };

  const onSubmit = (data: any) => {
    submit(data, {
      method: 'post',
    });
  };

  const label = isSubPage
    ? 'wiki.createform.subpage.label'
    : 'wiki.createform.page.label';

  const placeholder = isSubPage
    ? 'wiki.createform.subpage.placeholder'
    : 'wiki.createform.page.placeholder';

  const save = isSubPage
    ? 'wiki.createform.subpage.save'
    : 'wiki.createform.page.save';

  return {
    register,
    handleEditorChange,
    handleSubmit,
    onSubmit,
    disableToggle,
    control,
    isSubmitting,
    isDirty,
    isValid,
    editorRef,
    label,
    placeholder,
    save,
  };
};
