import {
  useBeforeUnload,
  useBlocker,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Page } from '~/models';

export const useCancelPage = (isModified: boolean, page?: Page) => {
  const params = useParams();

  const navigate = useNavigate();

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isModified && currentLocation !== nextLocation
  );

  const isBlocked = blocker.state === 'blocked';

  useBeforeUnload((event) => {
    if (isModified) {
      event.preventDefault();
    }
  });

  const handleOnButtonCancel = () => {
    if (isModified) {
      if (page) {
        navigate(`/id/${params.wikiId}/page/${page._id}`);
      } else {
        navigate(`/id/${params.wikiId}`);
      }
    } else {
      navigate('..');
    }
  };

  const handleClosePage = () => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  return { handleOnButtonCancel, handleClosePage, isBlocked, blocker };
};
