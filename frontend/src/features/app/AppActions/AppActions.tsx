import {
  Dropdown,
  DropdownMenuOptions,
  IconButton,
  IconButtonProps,
  useEdificeClient,
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
  className?: string;
} & DropdownMenuOptions;

export const AppActions = ({ canPrint }: { canPrint: boolean }) => {
  const userRights = useUserRights();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  const { t: portalTranslation } = useTranslation();

  const { setOpenShareModal, setOpenUpdateModal, setOpenPrintModal } =
    useWikiActions();

  const dropdownOptions: ActionDropdownMenuOptions[] = [
    {
      id: 'share',
      label: portalTranslation('share'),
      icon: <IconShare />,
      action: () => setOpenShareModal(true),
      visibility: userRights.manager,
    },
    {
      id: 'properties',
      label: portalTranslation('properties'),
      icon: <IconSettings />,
      action: () => setOpenUpdateModal(true),
      visibility: userRights.manager,
    },
    {
      id: 'print',
      label: portalTranslation('print'),
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
            <Dropdown.MenuGroup
              label={t('wiki.app.actions.dropdown.menugroup.label')}
            >
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
            </Dropdown.MenuGroup>
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
