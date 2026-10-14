import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEventHandler } from 'react';
import { CircleAlert, Info } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';

const meta = {
  component: Alert,
  tags: ['ai-generated'],
  args: {
    children: (
      <>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>Your workspace settings were updated.</AlertDescription>
      </>
    ),
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const alert = canvas.getByRole('alert');
    await expect(alert).toHaveTextContent('Heads up!');
    await expect(alert).toHaveTextContent('Your workspace settings were updated.');
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <CircleAlert aria-hidden />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined. Update your billing details.</AlertDescription>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Payment failed');
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Info aria-hidden />
        <AlertTitle>New version available</AlertTitle>
        <AlertDescription>Reload the page to get the latest features.</AlertDescription>
      </>
    ),
  },
};

export const TitleOnly: Story = {
  args: { children: <AlertTitle>Changes saved</AlertTitle> },
};

export const WithLongText: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Scheduled maintenance this weekend for all regions</AlertTitle>
        <AlertDescription>
          The admin console will be read-only between 01:00 and 03:00 UTC on Saturday while we
          migrate the database cluster. Exports started before the window will continue in the
          background and you will be notified by email when they finish.
        </AlertDescription>
      </>
    ),
  },
};

export const WithAction: Story = {
  render: ({ onClick, ...args }) => (
    <Alert {...args}>
      <AlertTitle>Session expiring</AlertTitle>
      <AlertDescription>You will be signed out in 5 minutes.</AlertDescription>
      <AlertAction>
        <Button size="xs" variant="outline" onClick={onClick as MouseEventHandler}>
          Extend
        </Button>
      </AlertAction>
    </Alert>
  ),
  args: { onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Extend' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
