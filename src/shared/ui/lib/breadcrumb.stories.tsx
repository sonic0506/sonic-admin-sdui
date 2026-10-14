import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';

const meta = {
  component: Breadcrumb,
  tags: ['ai-generated'],
  args: {
    children: (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/orders">Orders</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Order #1024</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    ),
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('navigation', { name: 'breadcrumb' })).toBeVisible();
    const home = canvas.getByRole('link', { name: 'Home' });
    await expect(home).toHaveAttribute('href', '/');
    await expect(canvas.getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '/orders');
    await expect(canvas.getByText('Order #1024')).toHaveAttribute('aria-current', 'page');

    await userEvent.tab();
    await expect(home).toHaveFocus();
  },
};

export const WithEllipsis: Story = {
  args: {
    children: (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/settings/team">Team</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Permissions</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link', { name: /Home|Team/ })).toHaveLength(2);
    await expect(canvas.getByText('Permissions')).toHaveAttribute('aria-current', 'page');
  },
};

export const CustomSeparator: Story = {
  args: {
    children: (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    ),
  },
};
