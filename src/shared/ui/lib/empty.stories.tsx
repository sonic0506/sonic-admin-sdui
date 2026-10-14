import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEventHandler } from 'react';
import { Inbox } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { Button } from './button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './empty';

const meta = {
  component: Empty,
  tags: ['ai-generated'],
  args: {
    children: (
      <EmptyHeader>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>Create your first project to get started.</EmptyDescription>
      </EmptyHeader>
    ),
  },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No projects yet')).toBeVisible();
    await expect(canvas.getByText('Create your first project to get started.')).toBeVisible();
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox aria-hidden />
        </EmptyMedia>
        <EmptyTitle>Inbox zero</EmptyTitle>
        <EmptyDescription>You have no unread messages.</EmptyDescription>
      </EmptyHeader>
    ),
  },
};

export const WithAction: Story = {
  render: ({ onClick, ...args }) => (
    <Empty {...args} className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox aria-hidden />
        </EmptyMedia>
        <EmptyTitle>No orders found</EmptyTitle>
        <EmptyDescription>
          Try a different filter or <a href="/orders/import">import orders</a>.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onClick as MouseEventHandler}>Create order</Button>
      </EmptyContent>
    </Empty>
  ),
  args: { onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('link', { name: 'import orders' })).toHaveAttribute(
      'href',
      '/orders/import',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Create order' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
