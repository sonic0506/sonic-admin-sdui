import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeCheck } from 'lucide-react';
import { expect } from 'storybook/test';
import { Badge } from './badge';

const VARIANTS = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const;

const meta = {
  component: Badge,
  tags: ['ai-generated'],
  args: { children: 'New' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('New')).toBeVisible();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((variant) => (
        <Badge {...args} key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <BadgeCheck data-icon="inline-start" aria-hidden />
        Verified
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Verified')).toBeVisible();
  },
};

export const WithLongText: Story = {
  args: { children: 'Pending review by the compliance team' },
};

export const AsLink: Story = {
  args: {
    asChild: true,
    variant: 'outline',
    children: <a href="/orders?status=pending">Pending 3</a>,
  },
  play: async ({ canvas, userEvent }) => {
    const link = canvas.getByRole('link', { name: 'Pending 3' });
    await expect(link).toHaveAttribute('href', '/orders?status=pending');
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};
