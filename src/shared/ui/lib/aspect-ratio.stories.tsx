import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AspectRatio } from './aspect-ratio';

const meta = {
  component: AspectRatio,
  tags: ['ai-generated'],
  args: {
    ratio: 16 / 9,
    children: (
      <div className="flex size-full items-center justify-center rounded-md bg-muted text-sm">
        16:9
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const content = canvas.getByText('16:9');
    await expect(content).toBeVisible();
    const { width, height } = content.getBoundingClientRect();
    await expect(width / height).toBeCloseTo(16 / 9, 1);
  },
};

export const Square: Story = {
  args: {
    ratio: 1,
    children: (
      <div className="flex size-full items-center justify-center rounded-md bg-muted text-sm">
        1:1
      </div>
    ),
  },
  play: async ({ canvas }) => {
    const { width, height } = canvas.getByText('1:1').getBoundingClientRect();
    await expect(width / height).toBeCloseTo(1, 1);
  },
};
