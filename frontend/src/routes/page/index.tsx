import { Editor, EditorRef } from '@edifice-ui/editor';
import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import { useRef } from 'react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useParams,
} from 'react-router-dom';
import { ContentTitle } from '~/features/wiki/ContentHeader';
import { pageQueryOptions, useGetPage, wikiService } from '~/services';

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

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return data ? (
    <div className="d-flex flex-column mt-24 ms-md-24 me-md-16">
      <ContentTitle page={data} />
      <Editor
        ref={editorRef}
        content={data.content}
        mode="read"
        variant="ghost"
        visibility="protected"
      ></Editor>
    </div>
  ) : null;
};
