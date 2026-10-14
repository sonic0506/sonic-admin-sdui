import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Spinner } from './spinner';

const meta = {
  component: Spinner,
  tags: ['ai-generated'],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  },
};

export const Large: Story = {
  args: { className: 'size-8' },
};

export const CustomLabel: Story = {
  args: { 'aria-label': 'Saving changes' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Saving changes' })).toBeInTheDocument();
  },
};
