import { Editor, EditorRef } from '@edifice-ui/editor';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import { useEffect, useRef } from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { PageHeader } from '~/features/page/PageHeader/PageHeader';
import { Wiki } from '~/models';
import { wikiQueryOptions } from '~/services';

export const pageLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findAllPages(params.wikiId!, true)
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
  const editorRef = useRef<EditorRef>(null);

  const postMetadata = useLoaderData() as Wiki;

  useEffect(() => {
    // Use setTimeout to update the message after 2000 milliseconds (2 seconds)
    const timeoutId = setTimeout(() => window.print(), 1000);

    // Cleanup function to clear the timeout if the component unmounts
    return () => clearTimeout(timeoutId);
  }, []);

  return postMetadata ? (
    <>
      {postMetadata.pages.map((page) => (
        <div className="d-flex flex-column mt-24 ms-md-24 me-md-16 rounded border pt-16">
          <div className="m-32">
            <PageHeader page={page} isPrint={true} />
            <Editor
              ref={editorRef}
              content={page.content}
              mode="read"
              variant="ghost"
              visibility="protected"
            ></Editor>
          </div>
        </div>
      ))}
    </>
  ) : null;
};
