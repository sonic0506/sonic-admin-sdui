import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Progress } from './progress';

const meta = {
  component: Progress,
  tags: ['ai-generated'],
  args: { 'aria-label': 'Upload progress', value: 60 },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Upload progress' });
    await expect(bar).toHaveAttribute('aria-valuenow', '60');
    await expect(bar).toHaveAttribute('data-state', 'loading');
  },
};

export const Empty: Story = {
  args: { value: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Upload progress' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  },
};

export const Complete: Story = {
  args: { value: 100 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Upload progress' })).toHaveAttribute(
      'data-state',
      'complete',
    );
  },
};

export const Indeterminate: Story = {
  args: { value: null },
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Upload progress' });
    await expect(bar).not.toHaveAttribute('aria-valuenow');
    await expect(bar).toHaveAttribute('data-state', 'indeterminate');
  },
};
