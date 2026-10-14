import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Label } from './label';
import { Textarea } from './textarea';

const meta = {
  component: Textarea,
  tags: ['ai-generated'],
  args: { 'aria-label': 'Message', placeholder: 'Type your message here.', onChange: fn() },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.type(textarea, 'Hello{Enter}World');
    await expect(textarea).toHaveValue('Hello\nWorld');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const WithLabel: Story = {
  args: { 'aria-label': undefined, id: 'message' },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="message">Message</Label>
      <Textarea {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Message'));
    await expect(canvas.getByRole('textbox', { name: 'Message' })).toHaveFocus();
  },
};

export const WithLongValue: Story = {
  args: {
    defaultValue:
      'The order was delayed because the warehouse was closed for inventory.\nWe expect it to ship within three business days.\nPlease contact support if you have any questions.',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Message' });
    await expect(textarea).toBeDisabled();
    // disabled 상태는 pointer-events 검사에 걸리므로 끄고 실제 입력을 시도한다
    await userEvent.setup({ pointerEventsCheck: 0 }).type(textarea, 'abc');
    await expect(textarea).toHaveValue('');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'Read-only note' },
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.type(textarea, 'abc');
    await expect(textarea).toHaveValue('Read-only note');
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'x' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Message' })).toBeInvalid();
  },
};
