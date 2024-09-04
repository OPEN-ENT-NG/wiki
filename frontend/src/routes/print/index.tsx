import { Editor, EditorRef } from '@edifice-ui/editor';
import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import { useRef } from 'react';
import { LoaderFunctionArgs, useLoaderData, useParams } from 'react-router-dom';
import { ContentHeader } from '~/features/wiki/ContentHeader';
import { Wiki } from '~/models';
import { useGetPagesFromWiki, wikiQueryOptions } from '~/services';

export const pageLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!)
    );

    if (odeServices.http().isResponseError()) {
      throw new Response('', {
        status: odeServices.http().latestResponse.status,
        statusText: odeServices.http().latestResponse.statusText,
      });
    }

    return data;
  };

export const Component = () => {
  const params = useParams();
  const editorRef = useRef<EditorRef>(null);

  const postMetadata = useLoaderData() as Wiki;

  const { isPending, error, data } = useGetPagesFromWiki({
    wikiId: params.wikiId!,
  });

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return data ? (
    <>
      {postMetadata.pages.map((page) => (
        <div className="d-flex flex-column mt-24 ms-md-24 me-md-16">
          <ContentHeader page={page} />
          <Editor
            ref={editorRef}
            content={page.content}
            mode="read"
            variant="ghost"
            visibility="protected"
          ></Editor>
        </div>
      ))}
    </>
  ) : null;
};
