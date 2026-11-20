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
  function NumberStepper({
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
    name,
  }) {
    const changeValue = (nextValue: number) => {
      if (disabled || readOnly) return;
      const boundedValue = Math.min(max ?? Infinity, Math.max(min, nextValue));
      if (boundedValue !== value) onChange(boundedValue);
    };

    return (
      <div className="number-stepper">
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
        <span className="number-stepper__label">{formatValue(value)}</span>
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
