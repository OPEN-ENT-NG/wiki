import { useEffect, useState } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';
import { useUserRights } from '~/store';
import { findDefaultPage } from '~/utils/findDefaultPage';

export const useRedirectDefaultPage = () => {
  const [isRedirecting, setIsRedirecting] = useState<boolean>(true);
  const params = useParams();
  const navigate = useNavigate();

  const matchWikiRoute = useMatch('/id/:wikiId');

  const userRights = useUserRights();

  const { data: wiki } = useGetWiki(params.wikiId!);

  useEffect(() => {
    if (!wiki) return; // Wait for wiki data to load before deciding

    if (matchWikiRoute) {
      // If wiki has pages, redirect to wiki's default page
      if (wiki.pages.length) {
        const defaultPage = findDefaultPage(wiki, userRights);
        if (defaultPage) {
          navigate(`/id/${wiki._id}/page/${defaultPage._id}`, {
            // replace: true prevents adding a new entry in the browser history
            // when redirecting to the default page
            replace: true,
          });
          return; // Keep isRedirecting true while navigation resolves
        }
      } else {
        // Redirect to Pages Assistant if no pages exist
        if (userRights.manager || userRights.creator || userRights.contrib) {
          navigate(`/id/${wiki._id}/pages/assistant`, {
            replace: true,
          });
          return; // Keep isRedirecting true while navigation resolves
        }
      }
    }

    // Only reached when no navigation was triggered
    setIsRedirecting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wiki]);

  return { isRedirecting };
};
