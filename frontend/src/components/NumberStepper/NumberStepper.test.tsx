import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumberStepper, NumberStepperProps } from './NumberStepper';

const labels = {
  decrementLabel: 'Fewer sessions',
  incrementLabel: 'More sessions',
};

function ControlledStepper(props: Partial<NumberStepperProps>) {
  const [value, setValue] = useState(5);
  return (
    <NumberStepper {...labels} value={value} onChange={setValue} {...props} />
  );
}

describe('NumberStepper', () => {
  it('increments and decrements a controlled numeric form value', () => {
    const { container } = render(
      <ControlledStepper
        name="sessions"
        formatValue={(value) => `${value} seances`}
      />,
    );

    const input = container.querySelector('input[name="sessions"]');
    expect(input).toHaveAttribute('type', 'hidden');

    fireEvent.click(screen.getByRole('button', { name: 'More sessions' }));
    expect(screen.getByText('6 seances')).toBeInTheDocument();
    expect(input).toHaveValue('6');

    fireEvent.click(screen.getByRole('button', { name: 'Fewer sessions' }));
    expect(screen.getByText('5 seances')).toBeInTheDocument();
    expect(input).toHaveValue('5');
    expect(
      screen.getByRole('button', { name: 'More sessions' }),
    ).toHaveAttribute('type', 'button');
  });

  it('clamps steps and disables buttons at the bounds', () => {
    render(<ControlledStepper min={4} max={6} step={2} />);

    fireEvent.click(screen.getByRole('button', { name: 'More sessions' }));
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'More sessions' }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Fewer sessions' }));
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Fewer sessions' }),
    ).toBeDisabled();
  });

  it.each([{ disabled: true }, { readOnly: true }])(
    'prevents changes when %o',
    (props) => {
      const onChange = vi.fn();
      render(
        <NumberStepper {...labels} value={5} onChange={onChange} {...props} />,
      );

      const decrement = screen.getByRole('button', { name: 'Fewer sessions' });
      const increment = screen.getByRole('button', { name: 'More sessions' });

      expect(decrement).toBeDisabled();
      expect(increment).toBeDisabled();
      fireEvent.click(decrement);
      fireEvent.click(increment);
      expect(onChange).not.toHaveBeenCalled();
    },
  );
});
