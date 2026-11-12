import { forwardRef, Ref } from 'react';

import clsx from 'clsx';
import { Button, ButtonProps, ButtonRef } from '@edifice.io/react';
import './AIButton.css';

/**
 * AIButton extends ButtonComponent.
 */
const AIButton = forwardRef(
  (
    { children, className, ...restProps }: ButtonProps,
    ref?: Ref<ButtonRef>,
  ) => {
    const buttonProps = {
      ...restProps,
      ...{
        className: clsx('btn-ai', className),
      },
      size: restProps.size || 'sm',
    };

    return (
      <div className="btn-ai-wrapper">
        <Button ref={ref} {...buttonProps} children={children} />
      </div>
    );
  },
);

AIButton.displayName = 'AIButton';

export default AIButton;
