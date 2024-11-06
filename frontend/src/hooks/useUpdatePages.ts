import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { UpdateTreeDataWithVisibility } from '~/models';
import { useGetPagesFromWiki, wikiQueryOptions } from '~/services';
import { wikiService } from '~/services/api';

export const useUpdatePages = (wikiId: string) => {
  const queryClient = useQueryClient();
  const { data: originalPages } = useGetPagesFromWiki({
    wikiId,
    content: false,
    force: true,
  });
  const handleSortPage = useCallback(
    async (pages: UpdateTreeDataWithVisibility[]) => {
      try {
        //TODO backend should handle this with custom api for moving pages
        // Process each page
        for (const page of pages) {
          // Get the original page
          const originalPage = originalPages?.find((p) => p._id === page._id);
          // Keep the same visibility by default
          if (originalPage) {
            page.isVisible = originalPage.isVisible;
          }
          // Get the parent page if it exists
          if (page.parentId) {
            const parentPage = originalPages?.find(
              (p) => p._id === page.parentId,
            );
            // Update the visibility of the page if the parent page is not visible
            if (parentPage && !parentPage.isVisible) {
              page.isVisible = false;
            }
            // else keep the same visibility
          }
        }

        // Update all pages with their new visibilities
        if (pages.length > 0) {
          const findFirstPage = pages.find((page) => page.position === 0);
          await wikiService.updatePages({
            wikiId,
            data: {
              pages: pages.map((page) => ({
                _id: page._id,
                parentId: page.parentId!,
                isVisible: page.isVisible ?? false,
                position: page.position ?? 0,
                isIndex: page._id === findFirstPage?._id ? true : false,
              })),
            },
          });
          // invalidate the query
          queryClient.invalidateQueries({
            queryKey: wikiQueryOptions.findOne(wikiId).queryKey,
          });
        }

        return true;
      } catch (error) {
        console.error('Error updating pages visibility:', error);
        return false;
      }
    },
    [wikiId, originalPages, queryClient],
  );

  return { handleSortPage };
};
