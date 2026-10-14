import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Slider } from './slider';

const meta = {
  component: Slider,
  tags: ['ai-generated'],
  args: { defaultValue: [50], onValueChange: fn(), onValueCommit: fn() },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const thumb = canvas.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-valuenow', '50');
    await userEvent.tab();
    await expect(thumb).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '51');
    await expect(args.onValueChange).toHaveBeenLastCalledWith([51]);
    await expect(args.onValueCommit).toHaveBeenLastCalledWith([51]);
    await userEvent.keyboard('{End}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');
  },
};

export const Range: Story = {
  args: { defaultValue: [25, 75] },
  play: async ({ args, canvas, userEvent }) => {
    const min = canvas.getByRole('slider', { name: 'Minimum' });
    const max = canvas.getByRole('slider', { name: 'Maximum' });
    await expect(min).toHaveAttribute('aria-valuenow', '25');
    await expect(max).toHaveAttribute('aria-valuenow', '75');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(min).toHaveAttribute('aria-valuenow', '24');
    await expect(args.onValueChange).toHaveBeenLastCalledWith([24, 75]);
  },
};

export const WithStep: Story = {
  args: { defaultValue: [20], step: 10 },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
    await expect(args.onValueChange).toHaveBeenLastCalledWith([30]);
  },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const thumb = canvas.getByRole('slider');
    await userEvent.tab();
    await expect(thumb).not.toHaveFocus();
    await expect(thumb).toHaveAttribute('aria-valuenow', '50');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
