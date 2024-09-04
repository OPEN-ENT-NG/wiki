import {
  useBeforeUnload,
  useBlocker,
  useNavigate,
  useNavigation,
  useParams,
} from 'react-router-dom';
import { Page } from '~/models';

export const useCancelPage = (isModified: boolean, page?: Page) => {
  const params = useParams();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isSubmitting = navigation.state === 'submitting';

  useBeforeUnload((event) => {
    if (isModified) {
      event.preventDefault();
    }
  });

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isModified && currentLocation !== nextLocation
  );

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

  return { handleOnButtonCancel, handleClosePage, isSubmitting, blocker };
};
