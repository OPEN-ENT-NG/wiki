import { Editor, EditorRef } from '@edifice-ui/editor';
import { CommentProvider } from '@edifice-ui/react/comments';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import { useEffect, useRef } from 'react';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom';
import { MAX_COMMENT_LENGTH } from '~/config';
import { PageHeader } from '~/features/page/PageHeader/PageHeader';
import { Page } from '~/models';
import { pageQueryOptions } from '~/services';

export const printLoader =
  (queryClient: QueryClient) =>
  async ({ params, request }: LoaderFunctionArgs) => {
    const { searchParams } = new URL(request.url);
    const printPageId = searchParams.get('printPageId');
    const fetchData = async () => {
      if (printPageId) {
        return await queryClient.fetchQuery(
          pageQueryOptions.findOne({
            wikiId: params.wikiId!,
            pageId: printPageId,
          })
        );
      }
      return await queryClient.fetchQuery(
        pageQueryOptions.findAllFromWiki({
          wikiId: params.wikiId!,
          content: true,
        })
      );
    };

    const data = await fetchData();

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

  const data = useLoaderData() as Page[] | Page;

  const [searchParams] = useSearchParams();

  const isPrintComment = searchParams.get('printComment') === 'true';

  useEffect(() => {
    // Use setTimeout to update the message after 2000 milliseconds (2 seconds)
    const timeoutId = setTimeout(() => window.print(), 1000);

    // Cleanup function to clear the timeout if the component unmounts
    return () => clearTimeout(timeoutId);
  }, []);

  const printPage = (page: Page) => {
    return (
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
          {isPrintComment && (
            <CommentProvider
              type="read"
              comments={page.comments}
              options={{
                maxCommentLength: MAX_COMMENT_LENGTH,
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return data
    ? Array.isArray(data as Page[])
      ? (data as Page[]).map((page) => printPage(page))
      : printPage(data as Page)
    : null;
};
