import { forwardRef, InputHTMLAttributes } from 'react';

export const Toggle = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ ...restProps }, ref) => {
  return (
    <label className="switch">
      <input type="checkbox" ref={ref} {...restProps} />
      <span className="slider round"></span>
    </label>
  );
});
