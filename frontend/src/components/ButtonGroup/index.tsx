import clsx from 'clsx';

export interface ButtonGroupProps {
  className?: string;
  children: Array<JSX.Element | false>;
  variant?: 'reverse';
}

export const ButtonGroup = ({
  className,
  variant,
  children,
}: ButtonGroupProps) => {
  const classes = clsx(
    'd-flex flex-fill align-items-center justify-content-end',
    className,
    {
      'align-self-end flex-wrap-reverse': variant === 'reverse',
    }
  );
  return <div className={classes}>{children}</div>;
};
