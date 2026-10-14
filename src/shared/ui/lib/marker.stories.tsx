import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { Marker, MarkerContent, MarkerIcon } from './marker';

const meta = {
  component: Marker,
  tags: ['ai-generated'],
  args: { children: <MarkerContent>Today</MarkerContent> },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Marker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Today')).toBeVisible();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {(['default', 'separator', 'border'] as const).map((variant) => (
        <Marker {...args} key={variant} variant={variant}>
          <MarkerContent>{variant}</MarkerContent>
        </Marker>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <MarkerIcon>
          <InfoIcon />
        </MarkerIcon>
        <MarkerContent>Conversation started</MarkerContent>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Conversation started')).toBeVisible();
  },
};

export const WithLongText: Story = {
  args: {
    variant: 'separator',
    children: (
      <MarkerContent>
        This conversation was transferred to the billing team for further review
      </MarkerContent>
    ),
  },
};

export const AsLink: Story = {
  args: {
    asChild: true,
    children: <a href="/history">View earlier messages</a>,
  },
  play: async ({ canvas, userEvent }) => {
    const link = canvas.getByRole('link', { name: 'View earlier messages' });
    await expect(link).toHaveAttribute('href', '/history');
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};
