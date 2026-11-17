import { IconMinus, IconPlus } from '@edifice.io/react/icons';
import { forwardRef, InputHTMLAttributes } from 'react';
import './NumberStepper.css';

export interface NumberStepperProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
  decrementLabel: string;
  incrementLabel: string;
}

export const NumberStepper = forwardRef<HTMLInputElement, NumberStepperProps>(
  function NumberStepper(
    {
      value,
      onChange,
      min = 0,
      max,
      step = 1,
      formatValue = String,
      decrementLabel,
      incrementLabel,
      disabled,
      readOnly,
      className,
      name,
      onKeyDown,
      ...inputProps
    },
    ref,
  ) {
    const changeValue = (nextValue: number) => {
      if (disabled || readOnly) return;
      const boundedValue = Math.min(max ?? Infinity, Math.max(min, nextValue));
      if (boundedValue !== value) onChange(boundedValue);
    };

    return (
      <div className={['number-stepper', className].filter(Boolean).join(' ')}>
        <button
          type="button"
          className="number-stepper__button"
          aria-label={decrementLabel}
          title={decrementLabel}
          disabled={disabled || readOnly || value <= min}
          onClick={() => changeValue(value - step)}
        >
          <IconMinus aria-hidden="true" />
        </button>
        <input
          {...inputProps}
          ref={ref}
          type="text"
          role="spinbutton"
          className="number-stepper__input"
          value={formatValue(value)}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={formatValue(value)}
          disabled={disabled}
          readOnly
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault();
              changeValue(value + (event.key === 'ArrowUp' ? step : -step));
            } else if (event.key === 'Home') {
              event.preventDefault();
              changeValue(min);
            } else if (event.key === 'End' && max !== undefined) {
              event.preventDefault();
              changeValue(max);
            }
          }}
        />
        {name && (
          <input type="hidden" name={name} value={value} disabled={disabled} />
        )}
        <button
          type="button"
          className="number-stepper__button"
          aria-label={incrementLabel}
          title={incrementLabel}
          disabled={disabled || readOnly || (max !== undefined && value >= max)}
          onClick={() => changeValue(value + step)}
        >
          <IconPlus aria-hidden="true" />
        </button>
      </div>
    );
  },
);
