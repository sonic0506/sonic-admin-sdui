import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEventHandler } from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { Button } from './button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './item';

const meta = {
  component: Item,
  tags: ['ai-generated'],
  args: {
    children: (
      <ItemContent>
        <ItemTitle>Basic item</ItemTitle>
        <ItemDescription>A simple item with title and description.</ItemDescription>
      </ItemContent>
    ),
  },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Basic item')).toBeVisible();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['default', 'outline', 'muted'] as const).map((variant) => (
        <Item {...args} key={variant} variant={variant}>
          <ItemContent>
            <ItemTitle>{variant}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['default', 'sm', 'xs'] as const).map((size) => (
        <Item {...args} key={size} size={size} variant="outline">
          <ItemContent>
            <ItemTitle>Size {size}</ItemTitle>
            <ItemDescription>Description for size {size}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};

export const WithMediaAndActions: Story = {
  render: ({ onClick, ...args }) => (
    <Item {...args} variant="outline">
      <ItemMedia variant="icon">
        <ShieldCheck aria-hidden />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Two-factor authentication</ItemTitle>
        <ItemDescription>Protect your account with an extra verification step.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline" onClick={onClick as MouseEventHandler}>
          Enable
        </Button>
      </ItemActions>
    </Item>
  ),
  args: { onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Enable' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <ItemHeader>
          <span>Invoice INV001</span>
          <span>Paid</span>
        </ItemHeader>
        <ItemContent>
          <ItemTitle>Acme Corp</ItemTitle>
          <ItemDescription>Billed on 2024-01-15</ItemDescription>
        </ItemContent>
        <ItemFooter>
          <span>Total</span>
          <span>$250.00</span>
        </ItemFooter>
      </>
    ),
  },
};

export const WithLongText: Story = {
  args: {
    variant: 'outline',
    className: 'w-80',
    children: (
      <ItemContent>
        <ItemTitle>
          A very long item title that should be clamped to a single line when it overflows
        </ItemTitle>
        <ItemDescription>
          This description is long enough to exceed two lines so that the line clamp applies and the
          remaining text is truncated with an ellipsis instead of growing the item endlessly.
        </ItemDescription>
      </ItemContent>
    ),
  },
};

export const AsLink: Story = {
  args: {
    asChild: true,
    variant: 'outline',
    children: (
      <a href="/settings/profile">
        <ItemContent>
          <ItemTitle>Profile settings</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRight aria-hidden />
        </ItemActions>
      </a>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const link = canvas.getByRole('link', { name: 'Profile settings' });
    await expect(link).toHaveAttribute('href', '/settings/profile');
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

export const Group: Story = {
  // ItemGroup 은 role="list" 이므로 각 Item 에 role="listitem" 을 지정해야 목록 구조가 올바르다
  render: (args) => (
    <ItemGroup>
      <Item {...args} role="listitem">
        <ItemContent>
          <ItemTitle>Alice Kim</ItemTitle>
          <ItemDescription>alice@example.com</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item {...args} role="listitem">
        <ItemContent>
          <ItemTitle>Brian Lee</ItemTitle>
          <ItemDescription>brian@example.com</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list');
    await expect(list).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
  },
};
