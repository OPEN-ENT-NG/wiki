import { useEdificeClient } from '@edifice.io/react';
import { IconViewList } from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import {
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

export const useMenu = ({
  onMenuClick,
}: {
  onMenuClick: (value: string) => void;
}) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  const isSelected = (path = '/') => {
    const match = matchPath(path, location.pathname);
    return match?.pathname === location.pathname;
  };

  const data = {
    children: t('wiki.pagelist'),
    onClick: () => navigate(`/id/${params.wikiId}/pages`),
    leftIcon: <IconViewList />,
    selected: isSelected('/id/:wikiId/pages') ?? false,
  };

  const handleOnMenuClick = () => {
    onMenuClick('');
    data.onClick();
  };

  return { data, handleOnMenuClick };
};
