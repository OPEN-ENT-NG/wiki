import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWikiActions } from '~/store';

type PrintGroup = 'allPages' | 'onePage';

export const useCheckablePrint = () => {
  const params = useParams();
  const { setOpenPrintModal } = useWikiActions();
  const [isAllPages, setIsAllPages] = useState<boolean>(false);
  const [printGroup, setPrintGroup] = useState<PrintGroup>('onePage');
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
      return `printPageId=${params.pageId}&printComment=${printComment}`;
    }
  };

  const handleOnPrintWiki = () => {
    const queryParams = generateQueryParams();
    window.open(`/print/id/${params.wikiId}?${queryParams}`, '_blank');
    setOpenPrintModal(false);
  };

  return {
    handleOnGroupChange,
    handleOnPrintComment,
    handleOnPrintWiki,
    printComment,
    printGroup,
  };
};
