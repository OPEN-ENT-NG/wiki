import { useState } from 'react';
import { Revision } from '~/models/revision';
import { useUserRights } from '~/store';

export const useRevisionTable = (data: Revision[] | undefined) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const findSelectedItem =
    selectedItems.length === 1
      ? data?.find((revision) => revision._id === selectedItems[0])
      : undefined;

  const isSelectedItemVisible = findSelectedItem?.isVisible ?? false;

  const userRights = useUserRights();
  const canManage = userRights.manager;

  const handleOnSelectItem = (itemId: string) => {
    setSelectedItems((currentSelection: string[]) => {
      const newSelection = [...currentSelection];
      if (!newSelection.includes(itemId)) {
        newSelection.push(itemId);
      } else {
        newSelection.splice(newSelection.indexOf(itemId), 1);
      }
      return newSelection;
    });
  };

  const handleOnSelectAllItems = (deselect: boolean) => {
    setSelectedItems(() => {
      return deselect ? [] : data?.map((item) => item._id) ?? [];
    });
  };

  const allItemsSelected = selectedItems?.length === data?.length;
  const isIndeterminate = data
    ? selectedItems?.length > 0 && selectedItems?.length < data?.length
    : false;

  const disabledRestoreButton =
    selectedItems.length !== 1 || (!isSelectedItemVisible && !canManage);
  const disabledVersionComparison =
    selectedItems.length < 2 || selectedItems.length > 2;

  return {
    selectedItems,
    allItemsSelected,
    disabledRestoreButton,
    disabledVersionComparison,
    isIndeterminate,
    handleOnSelectAllItems,
    handleOnSelectItem,
  };
};
