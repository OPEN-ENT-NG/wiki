import {
  useBeforeUnload,
  useBlocker,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Page } from '~/models';

export const useCancelPage = (isDirty: boolean, page?: Page) => {
  const params = useParams();

  const navigate = useNavigate();

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  const isBlocked = blocker.state === 'blocked';

  useBeforeUnload((event) => {
    if (isDirty) {
      event.preventDefault();
    }
  });

  const handleOnButtonCancel = () => {
    if (page) {
      navigate(`/id/${params.wikiId}/page/${page._id}`);
    } else {
      navigate(-1);
    }
  };

  const handleClosePage = () => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  return { handleOnButtonCancel, handleClosePage, isBlocked, blocker };
};
