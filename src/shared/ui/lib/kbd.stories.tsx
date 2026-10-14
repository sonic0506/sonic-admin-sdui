import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Kbd, KbdGroup } from './kbd';

const meta = {
  component: Kbd,
  tags: ['ai-generated'],
  args: { children: 'Esc' },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Esc')).toBeVisible();
  },
};

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <span>+</span>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('⌘')).toBeVisible();
    await expect(canvas.getByText('K')).toBeVisible();
  },
};

export const InText: Story = {
  render: () => (
    <p className="text-sm">
      Press <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> to save.
    </p>
  ),
};
