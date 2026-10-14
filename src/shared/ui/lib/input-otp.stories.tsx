import type { Meta, StoryObj } from '@storybook/react-vite';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { expect, fn } from 'storybook/test';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './input-otp';

const meta = {
  component: InputOTP,
  tags: ['ai-generated'],
  args: {
    maxLength: 6,
    'aria-label': 'Verification code',
    onChange: fn(),
    onComplete: fn(),
    children: (
      <>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </>
    ),
  },
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Verification code' });
    await userEvent.click(input);
    await userEvent.keyboard('123456');
    await expect(input).toHaveValue('123456');
    await expect(canvas.getByText('6')).toBeInTheDocument();
    await expect(args.onChange).toHaveBeenLastCalledWith('123456');
    await expect(args.onComplete).toHaveBeenCalledWith('123456');
  },
};

export const Partial: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Verification code' });
    await userEvent.click(input);
    await userEvent.keyboard('123');
    await expect(input).toHaveValue('123');
    await expect(args.onComplete).not.toHaveBeenCalled();
  },
};

export const DigitsOnly: Story = {
  args: { pattern: REGEXP_ONLY_DIGITS },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Verification code' });
    await userEvent.click(input);
    await userEvent.keyboard('a1b2');
    await expect(input).toHaveValue('12');
    await expect(args.onChange).toHaveBeenLastCalledWith('12');
  },
};

export const WithValue: Story = {
  args: { defaultValue: '123456' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Verification code' })).toHaveValue('123456');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Verification code' });
    await expect(input).toBeDisabled();
    await userEvent.setup({ pointerEventsCheck: 0 }).type(input, '123');
    await expect(input).toHaveValue('');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: '000',
    children: (
      <InputOTPGroup>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <InputOTPSlot key={index} index={index} aria-invalid />
        ))}
      </InputOTPGroup>
    ),
  },
};
