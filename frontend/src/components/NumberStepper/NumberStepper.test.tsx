import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumberStepper, NumberStepperProps } from './NumberStepper';

const labels = {
  'aria-label': 'Sessions',
  'decrementLabel': 'Fewer sessions',
  'incrementLabel': 'More sessions',
};

function ControlledStepper(props: Partial<NumberStepperProps>) {
  const [value, setValue] = useState(5);
  return (
    <NumberStepper {...labels} value={value} onChange={setValue} {...props} />
  );
}

describe('NumberStepper', () => {
  it('increments and decrements a controlled numeric form value', () => {
    render(
      <ControlledStepper
        name="sessions"
        formatValue={(value) => `${value} seances`}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'More sessions' }));
    expect(screen.getByRole('spinbutton')).toHaveValue('6 seances');
    fireEvent.click(screen.getByRole('button', { name: 'Fewer sessions' }));
    expect(screen.getByRole('spinbutton')).toHaveValue('5 seances');
    expect(
      screen.getByRole('button', { name: 'More sessions' }),
    ).toHaveAttribute('type', 'button');
    expect(screen.getByDisplayValue('5')).toHaveAttribute('name', 'sessions');
  });

  it('clamps steps and disables buttons at the bounds', () => {
    render(<ControlledStepper min={4} max={6} step={2} />);
    fireEvent.click(screen.getByRole('button', { name: 'More sessions' }));
    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-valuenow',
      '6',
    );
    expect(
      screen.getByRole('button', { name: 'More sessions' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Fewer sessions' }));
    expect(
      screen.getByRole('button', { name: 'Fewer sessions' }),
    ).toBeDisabled();
  });

  it('supports arrow keys and Home/End', () => {
    render(<ControlledStepper min={1} max={10} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveAttribute('aria-valuenow', '6');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-valuenow', '5');
    fireEvent.keyDown(input, { key: 'End' });
    expect(input).toHaveAttribute('aria-valuenow', '10');
    fireEvent.keyDown(input, { key: 'Home' });
    expect(input).toHaveAttribute('aria-valuenow', '1');
  });

  it.each([{ disabled: true }, { readOnly: true }])(
    'prevents changes when %o',
    (props) => {
      const onChange = vi.fn();
      render(
        <NumberStepper {...labels} value={5} onChange={onChange} {...props} />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'More sessions' }));
      fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' });
      expect(onChange).not.toHaveBeenCalled();
    },
  );
});
