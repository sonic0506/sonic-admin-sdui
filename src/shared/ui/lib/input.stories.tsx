import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Input } from './input';
import { Label } from './label';

const meta = {
  component: Input,
  tags: ['ai-generated'],
  args: { 'aria-label': 'Email', placeholder: 'name@example.com', onChange: fn() },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await userEvent.type(input, 'kim@example.com');
    await expect(input).toHaveValue('kim@example.com');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const WithLabel: Story = {
  args: { 'aria-label': undefined, id: 'email' },
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="email">Email</Label>
      <Input {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Email'));
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  },
};

export const WithValue: Story = {
  args: { defaultValue: 'kim@example.com' },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toBeDisabled();
    // disabled 스타일이 pointer-events:none 이라 user-event 기본 검사를 끄고 실제 입력을 시도한다
    await userEvent.setup({ pointerEventsCheck: 0 }).type(input, 'abc');
    await expect(input).toHaveValue('');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'kim@example.com' },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await userEvent.type(input, 'abc');
    await expect(input).toHaveValue('kim@example.com');
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'not-an-email' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeInvalid();
  },
};

export const Password: Story = {
  args: { type: 'password', 'aria-label': 'Password', placeholder: undefined },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('Password');
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.type(input, 'secret');
    await expect(input).toHaveValue('secret');
  },
};
