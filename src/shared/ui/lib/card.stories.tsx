import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEventHandler } from 'react';
import { expect, fn } from 'storybook/test';
import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

const meta = {
  component: Card,
  tags: ['ai-generated'],
  args: {
    className: 'w-80',
    children: (
      <>
        <CardHeader>
          <CardTitle>Monthly revenue</CardTitle>
          <CardDescription>Compared to last month</CardDescription>
        </CardHeader>
        <CardContent>
          <p>$12,480 (+12%)</p>
        </CardContent>
      </>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Monthly revenue')).toBeVisible();
    await expect(canvas.getByText('$12,480 (+12%)')).toBeVisible();
  },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const WithActionAndFooter: Story = {
  render: ({ onClick, ...args }) => (
    <Card {...args}>
      <CardHeader className="border-b">
        <CardTitle>Team members</CardTitle>
        <CardDescription>Invite people to collaborate.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline" onClick={onClick as MouseEventHandler}>
            Invite
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>3 members, 1 pending invitation</p>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="ghost">View all</Button>
      </CardFooter>
    </Card>
  ),
  args: { onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Invite' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('button', { name: 'View all' })).toBeVisible();
  },
};

export const WithLongContent: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>
            Quarterly compliance review for the enterprise customer onboarding pipeline
          </CardTitle>
          <CardDescription>
            This description is intentionally long so that it wraps across multiple lines inside the
            card instead of overflowing the container.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Averyveryverylongwordwithoutanyspacesthatshouldnotbreakthecardlayout.</p>
        </CardContent>
      </>
    ),
  },
};
