import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bold, Italic } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { Toggle } from './toggle';

const meta = {
  component: Toggle,
  tags: ['ai-generated'],
  args: { children: 'Bold', onPressedChange: fn() },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(false);
  },
};

export const ToggledByKeyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onPressedChange).toHaveBeenCalledTimes(2);
  },
};

export const Pressed: Story = {
  args: { defaultPressed: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toBeDisabled();
    // disabled 스타일이 pointer-events:none 이라 user-event 기본 검사를 끄고 실제 클릭을 시도한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Toggle {...args}>Default</Toggle>
      <Toggle {...args} variant="outline">
        Outline
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle {...args} size="sm">
        Small
      </Toggle>
      <Toggle {...args}>Default</Toggle>
      <Toggle {...args} size="lg">
        Large
      </Toggle>
    </div>
  ),
};

export const IconOnly: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <Toggle {...args} aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle {...args} aria-label="Italic" variant="outline">
        <Italic />
      </Toggle>
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Italic' }));
    await expect(canvas.getByRole('button', { name: 'Italic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
  },
};
