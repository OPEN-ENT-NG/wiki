import { Button, ButtonProps } from '@edifice-ui/react';
import clsx from 'clsx';
import { useMenuContext } from './MenuContext';

export type MenuButtonProps = Pick<
  ButtonProps,
  'children' | 'leftIcon' | 'rightIcon' | 'onClick'
> & {
  selected: boolean;
};

export const MenuButton = (props: MenuButtonProps) => {
  const { selected, leftIcon, rightIcon, onClick, children } = props;

  const { childProps } = useMenuContext();

  return (
    <Button
      style={{ width: '100%' }}
      variant="ghost"
      color="tertiary"
      className={clsx('stack', {
        selected: selected,
      })}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      onClick={onClick}
      {...childProps}
    >
      {children}
    </Button>
  );
};
