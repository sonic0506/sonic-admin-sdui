import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { Button } from './button';

const meta = {
  component: Button,
  tags: ['ai-generated', 'needs-work'],
  args: { children: 'Save', onClick: fn() },
  // react-docgen 이 cva 의 VariantProps 를 풀지 못해 object 컨트롤로 잡히므로 직접 지정한다
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const ActivatedByKeyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Save' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Save' });
    await expect(button).toBeDisabled();
    // disabled 스타일이 pointer-events:none 이라 user-event 기본 검사를 끄고 실제 클릭을 시도한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button {...args}>Default</Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="destructive">
        Destructive
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args} size="xs">
        Extra small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args}>Default</Button>
      <Button {...args} size="lg">
        Large
      </Button>
      <Button {...args} size="icon-xs" aria-label="Add (xs)">
        <Plus />
      </Button>
      <Button {...args} size="icon-sm" aria-label="Add (sm)">
        <Plus />
      </Button>
      <Button {...args} size="icon" aria-label="Add">
        <Plus />
      </Button>
      <Button {...args} size="icon-lg" aria-label="Add (lg)">
        <Plus />
      </Button>
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  args: {
    children: (
      <>
        <Plus data-icon="inline-start" />
        Add item
      </>
    ),
  },
};

export const AsChildLink: Story = {
  args: { asChild: true, children: <a href="/settings">Settings</a> },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    );
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Save' });
    // default variant 는 bg-primary (--primary: oklch(0.205 0 0)) — 전역 CSS 가 안 붙으면 실패한다
    await expect(getComputedStyle(button).backgroundColor).toBe('oklch(0.205 0 0)');
  },
};
