import {
  Options,
  Print,
  SetBackground,
  Settings,
  Share,
} from '@edifice-ui/icons';
import {
  Dropdown,
  DropdownMenuOptions,
  IconButton,
  IconButtonProps,
  useOdeClient,
} from '@edifice-ui/react';
import { RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { baseURL, useGetWiki } from '~/services';
import { useUserRights } from '~/store';

type ActionDropdownMenuOptions = {
  id: string;
  visibility: boolean;
} & DropdownMenuOptions;

export const AppActions = () => {
  const params = useParams();
  const { data } = useGetWiki(params.wikiId!);

  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  /** Store to handle correctly rights to access ressource to avoid unexpected re-renders  */
  const userRights = useUserRights();

  const dropdownOptions: ActionDropdownMenuOptions[] = [
    {
      id: 'background',
      label: t('collaborativewall.modal.background', { ns: appCode }),
      icon: <SetBackground />,
      action: () => console.log(''),
      visibility: userRights.creator || userRights.manager,
    },
    {
      id: 'share',
      label: t('share'),
      icon: <Share />,
      action: () => console.log(''),
      visibility: userRights.creator || userRights.manager,
    },
    {
      id: 'properties',
      label: t('properties'),
      icon: <Settings />,
      action: () => console.log(''),
      visibility: userRights.creator || userRights.manager,
    },
    {
      id: 'print',
      label: t('print'),
      icon: <Print />,
      action: () => window.open(`/${baseURL}/print/id/${data?._id}`),
      visibility: true,
    },
  ];

  return (
    <Dropdown>
      {(
        triggerProps: JSX.IntrinsicAttributes &
          Omit<IconButtonProps, 'ref'> &
          RefAttributes<HTMLButtonElement>
      ) => (
        <>
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
        </>
      )}
    </Dropdown>
  );
};
