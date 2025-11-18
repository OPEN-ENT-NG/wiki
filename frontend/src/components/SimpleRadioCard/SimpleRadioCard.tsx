import { ChangeEvent, forwardRef, Ref } from 'react';

import clsx from 'clsx';
import { Flex, Radio } from '@edifice.io/react';

export interface RadioCardProps {
  /**
   * The currently selected value in the radio group.
   */
  selectedValue: string;
  /**
   * The value associated with this specific radio card.
   */
  value: string;
  /**
   * The main label text for the radio card.
   */
  label: string;
  /**
   * Callback function triggered when the radio card selection changes.
   */

  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Optional additional CSS class names to apply to the radio card.
   */
  className?: string;
  /**
   * Optional model value associated with the radio card, can be a string, boolean, or number.
   */
  model?: string | boolean | number;
  /**
   * Optional name for the radio group, used to group radio cards together.
   */
  groupName?: string;
  /**
   * Optional image URL to display alongside the label.
   */
  image?: string;
}

const SimpleRadioCard = forwardRef(
  (
    {
      selectedValue,
      value,
      onChange,
      label,
      model = '',
      groupName = 'group',
      image,
      ...restProps
    }: RadioCardProps,
    ref: Ref<HTMLLabelElement>,
  ) => {
    const isSelected = selectedValue === value;
    const minWidth = image ? '265px' : '120px';
    const justifyContent = image ? 'start' : 'center';

    // Handle keyboard interaction for accessibility
    const handleKeyDown = (event: React.KeyboardEvent<HTMLLabelElement>) => {
      if (event.key === 'Enter') {
        const inputElement = event.currentTarget.querySelector(
          'input[type="radio"]',
        ) as HTMLInputElement;
        if (inputElement) {
          inputElement.click();
        }
      }
    };

    return (
      <label
        ref={ref}
        role="button"
        tabIndex={0}
        className={clsx(
          'border border-2 rounded-3',
          isSelected && 'border-secondary',
          isSelected && 'bg-blue-200',
          !isSelected && 'border-gray-300',
          !isSelected && 'bg-gray-200',
          restProps.className,
        )}
        style={{ minWidth: minWidth }}
        onKeyDown={handleKeyDown}
        {...restProps}
      >
        <Flex justify={justifyContent} align="center" gap="8" className="p-8">
          {image && (
            <img
              src={image}
              alt={value}
              style={{ width: '48px', height: '48px' }}
            />
          )}
          <span
            id={`radio-card-label-${value}`}
            className={clsx(isSelected && 'fw-bold')}
          >
            {label}
          </span>
          <Radio
            model={model}
            name={groupName}
            value={value}
            checked={isSelected}
            onChange={onChange}
            aria-labelledby={`radio-card-label-${value}`}
            className="d-none"
          />
        </Flex>
      </label>
    );
  },
);

SimpleRadioCard.displayName = 'SimpleRadioCard';

export default SimpleRadioCard;
