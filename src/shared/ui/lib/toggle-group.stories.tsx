import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bold, Italic, Underline } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

const meta = {
  component: ToggleGroup,
  tags: ['ai-generated'],
  args: { type: 'single', 'aria-label': 'Text alignment', onValueChange: fn() },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  ),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const center = canvas.getByRole('radio', { name: 'Center' });
    await userEvent.click(center);
    await expect(center).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('center');
    const right = canvas.getByRole('radio', { name: 'Right' });
    await userEvent.click(right);
    await expect(right).toBeChecked();
    await expect(center).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('right');
  },
};

export const KeyboardNavigation: Story = {
  args: { defaultValue: 'left' },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'Left' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const center = canvas.getByRole('radio', { name: 'Center' });
    await expect(center).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(center).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('center');
  },
};

export const Multiple: Story = {
  args: { type: 'multiple', 'aria-label': 'Text formatting' },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Bold' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Italic' }));
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(canvas.getByRole('button', { name: 'Italic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['bold', 'italic']);
  },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const OutlineAttached: Story = {
  args: { variant: 'outline', spacing: 0 },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <ToggleGroup {...args} size="sm" aria-label="Small alignment">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup {...args} aria-label="Default alignment">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup {...args} size="lg" aria-label="Large alignment">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const center = canvas.getByRole('radio', { name: 'Center' });
    await expect(center).toBeDisabled();
    // disabled 스타일이 pointer-events:none 이라 user-event 기본 검사를 끄고 실제 클릭을 시도한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(center);
    await expect(center).not.toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
