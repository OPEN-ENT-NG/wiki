import { ViewList } from '@edifice-ui/icons';
import {
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

export const useMenu = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isSelected = (path = '/') => {
    const match = matchPath(path, location.pathname);
    return match?.pathname === location.pathname;
  };

  const menus = {
    children: 'Liste des pages',
    onClick: () => navigate(`/id/${params.wikiId}/pages`),
    leftIcon: <ViewList />,
    selected: isSelected('/id/:wikiId/pages') ?? false,
  };

  return menus;
};
