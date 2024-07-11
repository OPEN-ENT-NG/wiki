import { TextPage } from '@edifice-ui/icons';
import { checkUserRight, Dropdown, Grid, TreeView } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { ID, odeServices } from 'edifice-ts-client';
import {
  LoaderFunctionArgs,
  Outlet,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AppHeader } from '~/features';
import { NewPage } from '~/features/wiki/NewPage';
import WikiEmptyScreen from '~/features/wiki/WikiEmptyScreen';
import { useFeedData } from '~/hooks/useFeedData';
import { useRedirectDefaultPage } from '~/hooks/useRedirectDefaultPage';
import { useGetWiki, wikiQueryOptions } from '~/services';
import { getUserRightsActions } from '~/store';
import { useTreeData } from '~/store/treeview';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!)
    );

    // TODO: wait normalized rights
    const userRights = await checkUserRight(data.rights);
    const { setUserRights } = getUserRightsActions();
    setUserRights(userRights);

    if (odeServices.http().isResponseError()) {
      throw new Response('', {
        status: odeServices.http().latestResponse.status,
        statusText: odeServices.http().latestResponse.statusText,
      });
    }

    return data;
  };

export const Index = () => {
  const params = useParams();
  const navigate = useNavigate();
  const treeData = useTreeData();
  const match = useMatch('/id/:wikiId');

  const { data } = useGetWiki(params.wikiId!);

  /**
   * Redirect to the default page if exist
   */
  useRedirectDefaultPage();

  /**
   * Feed treeData
   */
  useFeedData();

  const handleClick = (pageId: ID) => {
    navigate(`/id/${data?._id}/page/${pageId}`);
  };

  const test = [
    {
      id: '1',
      name: 'OUI',
      section: true,
      children: [
        {
          id: '2',
          name: 'OH QUE OUI',
        },
      ],
    },
    {
      id: '3',
      name: 'NON',
      section: true,
      children: [
        {
          id: '4',
          name: 'OH QUE NON',
        },
      ],
    },
  ];

  return (
    <>
      <AppHeader />
      <Grid className="flex-grow-1">
        <Grid.Col
          sm="3"
          lg="2"
          xl="3"
          className="border-end pt-16 pe-16 d-none d-lg-block"
          as="aside"
        >
          <NewPage />
          {treeData && (
            <TreeView
              data={treeData}
              showIcon={false}
              onTreeItemClick={handleClick}
            />
          )}
        </Grid.Col>
        <Grid.Col sm="4" md="8" lg="6" xl="9" className="mt-24">
          <div className="dropdown-treeview">
            <Dropdown block>
              <Dropdown.Trigger label="Pages" icon={<TextPage />} />
              <Dropdown.Menu>
                <TreeView data={test} />
              </Dropdown.Menu>
            </Dropdown>
          </div>
          {match ? <WikiEmptyScreen /> : <Outlet />}
        </Grid.Col>
      </Grid>
    </>
  );
};
