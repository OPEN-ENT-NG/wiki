import { ViewList } from '@edifice-ui/icons';
import { useOdeClient } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';
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

  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);

  const isSelected = (path = '/') => {
    const match = matchPath(path, location.pathname);
    return match?.pathname === location.pathname;
  };

  const menus = {
    children: t('wiki.pagelist'),
    onClick: () => navigate(`/id/${params.wikiId}/pages`),
    leftIcon: <ViewList />,
    selected: isSelected('/id/:wikiId/pages') ?? false,
  };

  return menus;
};
