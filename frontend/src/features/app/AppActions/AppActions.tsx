import {
  Dropdown,
  DropdownMenuOptions,
  IconButton,
  IconButtonProps,
} from '@edifice.io/react';
import {
  IconOptions,
  IconPrint,
  IconSettings,
  IconShare,
} from '@edifice.io/react/icons';
import { RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { Fragment } from 'react/jsx-runtime';
import { useUserRights } from '~/store';
import { useWikiActions } from '~/store/wiki';

export type ActionDropdownMenuOptions = {
  id: string;
  visibility: boolean;
} & DropdownMenuOptions;

export const AppActions = ({ canPrint }: { canPrint: boolean }) => {
  const userRights = useUserRights();

  const { t } = useTranslation();
  const { setOpenShareModal, setOpenUpdateModal, setOpenPrintModal } =
    useWikiActions();

  const dropdownOptions: ActionDropdownMenuOptions[] = [
    {
      id: 'share',
      label: t('share'),
      icon: <IconShare />,
      action: () => setOpenShareModal(true),
      visibility: userRights.manager,
    },
    {
      id: 'properties',
      label: t('properties'),
      icon: <IconSettings />,
      action: () => setOpenUpdateModal(true),
      visibility: userRights.manager,
    },
    {
      id: 'print',
      label: t('print'),
      icon: <IconPrint />,
      action: () => setOpenPrintModal(true),
      visibility: true,
    },
  ];

  const canManage = userRights.manager;

  return canManage ? (
    <Dropdown>
      {(
        triggerProps: JSX.IntrinsicAttributes &
          Omit<IconButtonProps, 'ref'> &
          RefAttributes<HTMLButtonElement>,
      ) => (
        <div data-testid="dropdown">
          <IconButton
            {...triggerProps}
            type="button"
            aria-label="label"
            color="primary"
            variant="outline"
            icon={<IconOptions />}
          />

          <Dropdown.Menu>
            {dropdownOptions.map((option) => (
              <Fragment key={option.id}>
                {option.type === 'divider' ? (
                  <Dropdown.Separator />
                ) : (
                  option.visibility && (
                    <Dropdown.Item
                      icon={option.icon}
                      onClick={() => option.action(null)}
                    >
                      {option.label}
                    </Dropdown.Item>
                  )
                )}
              </Fragment>
            ))}
          </Dropdown.Menu>
        </div>
      )}
    </Dropdown>
  ) : (
    canPrint && (
      <IconButton
        data-testid="print-button"
        variant="outline"
        icon={<IconPrint />}
        onClick={() => setOpenPrintModal(true)}
      />
    )
  );
};
