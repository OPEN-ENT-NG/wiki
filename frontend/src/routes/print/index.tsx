import { checkUserRight } from '@edifice.io/react';
import { CommentProvider } from '@edifice.io/react/comments';
import { Editor, EditorRef } from '@edifice.io/react/editor';
import { odeServices } from '@edifice.io/client';
import { QueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom';
import { MAX_COMMENT_LENGTH } from '~/config';
import { PageHeader } from '~/features/page/PageHeader/PageHeader';
import { useFilterVisiblePage } from '~/hooks';
import { Page } from '~/models';
import { pageQueryOptions, wikiQueryOptions } from '~/services';
import { getUserRightsActions } from '~/store';

export const printLoader =
  (queryClient: QueryClient) =>
  async ({ params, request }: LoaderFunctionArgs) => {
    const { searchParams } = new URL(request.url);
    const printPageId = searchParams.get('printPageId');

    const wikiData = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!),
    );

    const userRights = await checkUserRight(wikiData.rights);
    const { setUserRights } = getUserRightsActions();
    setUserRights(userRights);

    const fetchData = async () => {
      if (printPageId) {
        return await queryClient.fetchQuery(
          pageQueryOptions.findOne({
            wikiId: params.wikiId!,
            pageId: printPageId,
          }),
        );
      }
      return await queryClient.fetchQuery(
        pageQueryOptions.findAllFromWiki({
          wikiId: params.wikiId!,
          content: true,
        }),
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

  const filterVisiblePage = useFilterVisiblePage();

  const [searchParams] = useSearchParams();

  const isPrintComment = searchParams.get('printComment') === 'true';

  useEffect(() => {
    const timeoutId = setTimeout(() => window.print(), 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const printPage = (page: Page) => {
    return (
      <div className="d-flex flex-column mt-24 ms-md-24 me-md-16 rounded border pt-16  bg-white">
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
      ? (data as Page[])
          .filter(filterVisiblePage)
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((page) => printPage(page))
      : filterVisiblePage(data as Page)
        ? printPage(data as Page)
        : null
    : null;
};
