import {
  AppHeader as BaseAppHeader,
  Breadcrumb,
  LoadingScreen,
  useOdeClient,
} from '@edifice-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { IWebApp } from 'edifice-ts-client';
import { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { useGetWiki, wikiQueryOptions } from '~/services';
import { useOpenShareModal, useOpenUpdateModal, useWikiActions } from '~/store';
import { AppActions } from './AppActions';

/* Lazy Loaded Modals */
const UpdateModal = lazy(
  async () => await import('~/components/ResourceModal')
);
const ShareModal = lazy(async () => await import('~/components/ShareModal'));

export const AppHeader = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const openUpdateModal = useOpenUpdateModal();
  const openShareModal = useOpenShareModal();

  const { data } = useGetWiki(params.wikiId!);
  const { currentApp } = useOdeClient();
  const { setOpenUpdateModal, setOpenShareModal } = useWikiActions();

  const handleOnUpdateSuccess = async () => {
    if (!data) return;

    await queryClient.invalidateQueries({
      queryKey: wikiQueryOptions.findOne(data._id).queryKey,
    });

    setOpenUpdateModal(false);
  };

  return (
    <>
      <BaseAppHeader render={() => <AppActions />}>
        <Breadcrumb app={currentApp as IWebApp} name={data?.title}></Breadcrumb>
      </BaseAppHeader>
      <Suspense fallback={<LoadingScreen position={false} />}>
        {openUpdateModal && data && (
          <UpdateModal
            mode="update"
            isOpen={openUpdateModal}
            resourceId={data?._id}
            onCancel={() => setOpenUpdateModal(false)}
            onSuccess={handleOnUpdateSuccess}
          />
        )}
        {openShareModal && data && (
          <ShareModal
            isOpen={openShareModal}
            shareOptions={{
              resourceCreatorId: data.owner.userId,
              resourceId: data._id,
              resourceRights: data.rights,
            }}
            onCancel={() => setOpenShareModal(false)}
            onSuccess={() => setOpenShareModal(false)}
          />
        )}
      </Suspense>
    </>
  );
};
