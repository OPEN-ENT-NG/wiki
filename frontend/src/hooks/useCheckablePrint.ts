import { useState } from 'react';

type PrintGroup = 'allPages' | 'onePage';

export const useCheckablePrint = () => {
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

  return {
    handleOnGroupChange,
    handleOnPrintComment,
    printComment,
    printGroup,
  };
};
