import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from './bubble';

const meta = {
  component: Bubble,
  tags: ['ai-generated'],
  args: {
    children: <BubbleContent>Hi! How can I help you today?</BubbleContent>,
    onClick: fn(),
  },
} satisfies Meta<typeof Bubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Hi! How can I help you today?')).toBeVisible();
  },
};

export const Variants: Story = {
  render: (args) => (
    <BubbleGroup>
      {(
        ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'] as const
      ).map((variant) => (
        <Bubble {...args} key={variant} variant={variant}>
          <BubbleContent>{variant}</BubbleContent>
        </Bubble>
      ))}
    </BubbleGroup>
  ),
};

export const AlignedEnd: Story = {
  args: { align: 'end' },
};

export const WithLongText: Story = {
  args: {
    children: (
      <BubbleContent>
        This is a long message that should wrap inside the bubble instead of stretching it across
        the whole container.
        Averyveryverylongwordwithoutanyspacesthatmustbreakratherthanoverflowthebubble.
      </BubbleContent>
    ),
  },
};

export const Conversation: Story = {
  render: (args) => (
    <BubbleGroup>
      <Bubble {...args} variant="muted">
        <BubbleContent>Can you summarize the last report?</BubbleContent>
      </Bubble>
      <Bubble {...args} align="end">
        <BubbleContent>Sure — revenue grew 12% over the previous quarter.</BubbleContent>
      </Bubble>
      <Bubble {...args} variant="muted">
        <BubbleContent>Thanks!</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
};

export const WithReactions: Story = {
  render: (args) => (
    <BubbleGroup className="gap-8 p-6">
      <Bubble {...args}>
        <BubbleContent>Reaction below, at the end</BubbleContent>
        <BubbleReactions>👍 2</BubbleReactions>
      </Bubble>
      <Bubble {...args} variant="muted" align="end">
        <BubbleContent>Reaction above, at the start</BubbleContent>
        <BubbleReactions side="top" align="start">
          🎉 1
        </BubbleReactions>
      </Bubble>
    </BubbleGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('👍 2')).toBeVisible();
    await expect(canvas.getByText('🎉 1')).toBeVisible();
  },
};

export const AsButton: Story = {
  render: ({ onClick, ...args }) => (
    <Bubble {...args} variant="outline">
      <BubbleContent asChild>
        <button type="button" onClick={onClick}>
          Show suggested replies
        </button>
      </BubbleContent>
    </Bubble>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Show suggested replies' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveFocus();
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const AsLink: Story = {
  args: {
    children: (
      <BubbleContent asChild>
        <a href="/reports/q3">Open Q3 report</a>
      </BubbleContent>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Open Q3 report' })).toHaveAttribute(
      'href',
      '/reports/q3',
    );
  },
};
