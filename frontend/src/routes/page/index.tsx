import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useParams,
} from 'react-router-dom';
import { pageQueryOptions, useGetPage, wikiService } from '~/services';
import { Editor, EditorRef } from '@edifice-ui/editor';
import { useRef } from 'react';
import { ContentTitle } from '~/features/wiki/ContentTitle';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      pageQueryOptions.findOne({
        wikiId: params.wikiId!,
        pageId: params.pageId!,
      })
    );

    if (odeServices.http().isResponseError()) {
      throw new Response('', {
        status: odeServices.http().latestResponse.status,
        statusText: odeServices.http().latestResponse.statusText,
      });
    }

    return data;
  };

export async function action({ params }: ActionFunctionArgs) {
  await wikiService.deletePage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });
  return redirect(`/id/${params.wikiId}`);
}

export const Page = () => {
  const params = useParams();
  const editorRef = useRef<EditorRef>(null);

  const { isPending, error, data } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  const page = data?.pages[0];

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return page ? (
    <div className="d-flex flex-column mt-8 mx-md-8">
      <ContentTitle page={page} />
      <Editor
        ref={editorRef}
        content={page.content}
        mode={'read'}
        variant={'ghost'}
        visibility={'protected'}
      ></Editor>
    </div>
  ) : null;
};
