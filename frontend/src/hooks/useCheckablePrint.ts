import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { baseURL } from '~/services';
import { useSelectedPages, useWikiActions } from '~/store';

type PrintGroup = 'allPages' | 'onePage';

export const useCheckablePrint = () => {
  const params = useParams();
  const selectedPages = useSelectedPages();
  const { setOpenPrintModal } = useWikiActions();
  // If the pageId is not in the selectedPages store, use the pageId from the params
  const pageId = selectedPages[0] ?? params.pageId;
  const disableWikiPrint = selectedPages.length > 0;
  const [isAllPages, setIsAllPages] = useState<boolean>(!pageId ? true : false);
  const [printGroup, setPrintGroup] = useState<PrintGroup>(
    !pageId ? 'allPages' : 'onePage',
  );
  const [printComment, setPrintComment] = useState<boolean>(false);

  const handleOnPrintComment = (): void => {
    setPrintComment(!printComment);
  };

  const handleOnGroupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    let allPages: boolean;
    switch (value) {
      case 'allPages':
        allPages = true;
        break;
      case 'onePage':
        allPages = false;
        break;
      default:
        allPages = false;
    }
    setPrintGroup(value as unknown as PrintGroup);
    setIsAllPages(allPages);
  };

  const generateQueryParams = () => {
    if (isAllPages) {
      return `printComment=${printComment}`;
    } else {
      return `printPageId=${pageId}&printComment=${printComment}`;
    }
  };

  const handleOnPrintWiki = () => {
    const queryParams = generateQueryParams();
    window.open(
      `${baseURL}/print/id/${params.wikiId}?${queryParams}`,
      '_blank',
    );
    setOpenPrintModal(false);
  };

  return {
    handleOnGroupChange,
    handleOnPrintComment,
    handleOnPrintWiki,
    disableWikiPrint,
    printComment,
    printGroup,
    pageId,
  };
};
