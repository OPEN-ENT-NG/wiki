import { useOdeClient, useToast } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  useActionData,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { FormPage } from '~/features/page/FormPage';
import { Page } from '~/models';
import { wikiQueryOptions, wikiService } from '~/services';

export const action =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const toggle = formData.get('toggle') === 'on';

    try {
      const data = await wikiService.createPage({
        wikiId: params.wikiId!,
        data: {
          title,
          content,
          parentId: params.pageId! ?? undefined,
          isVisible: toggle,
        },
      });

      await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

      // Retournez les données sans rediriger
      return { success: true, data };
    } catch (error) {
      return { error };
    }
  };

export const CreatePage = () => {
  const toast = useToast();
  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);
  const navigate = useNavigate();
  const params = useParams();

  const actionData = useActionData() as {
    error: string;
    success: boolean;
    data: Page;
  };

  useEffect(() => {
    if (actionData?.error) {
      toast.error(t('wiki.toast.error.save.page'));
    } else if (actionData?.success) {
      toast.success(t('wiki.toast.success.save.page'));
      navigate(`/id/${params.wikiId}/page/${actionData.data._id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);
  return <FormPage />;
};
