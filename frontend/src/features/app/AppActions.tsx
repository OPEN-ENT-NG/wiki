import { Options, Print, Settings, Share } from '@edifice-ui/icons';
import {
  Dropdown,
  DropdownMenuOptions,
  IconButton,
  IconButtonProps,
} from '@edifice-ui/react';
import { RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { baseURL, useGetWiki } from '~/services';
import { useUserRights } from '~/store';
import { useWikiActions } from '~/store/wiki';

export type ActionDropdownMenuOptions = {
  id: string;
  visibility: boolean;
} & DropdownMenuOptions;

export const AppActions = () => {
  const params = useParams();
  const userRights = useUserRights();

  const { data } = useGetWiki(params.wikiId!);
  const { t } = useTranslation();
  const { setOpenShareModal, setOpenUpdateModal } = useWikiActions();

  const dropdownOptions: ActionDropdownMenuOptions[] = [
    {
      id: 'share',
      label: t('share'),
      icon: <Share />,
      action: () => setOpenShareModal(true),
      visibility: userRights.manager,
    },
    {
      id: 'properties',
      label: t('properties'),
      icon: <Settings />,
      action: () => setOpenUpdateModal(true),
      visibility: userRights.manager,
    },
    {
      id: 'print',
      label: t('print'),
      icon: <Print />,
      action: () => window.open(`/${baseURL}/print/id/${data?._id}`),
      visibility: true,
    },
  ];

  const canManage = userRights.manager;

  return canManage ? (
    <Dropdown>
      {(
        triggerProps: JSX.IntrinsicAttributes &
          Omit<IconButtonProps, 'ref'> &
          RefAttributes<HTMLButtonElement>
      ) => (
        <div data-testid="dropdown">
          <IconButton
            {...triggerProps}
            type="button"
            aria-label="label"
            color="primary"
            variant="outline"
            icon={<Options />}
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
    <IconButton
      data-testid="print-button"
      variant="outline"
      icon={<Print />}
      onClick={() => alert('print')}
    />
  );
};
