import type { Meta, StoryObj } from '@storybook/react-vite';
import { BotIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { Avatar, AvatarFallback } from './avatar';
import { Bubble, BubbleContent } from './bubble';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from './message';

const meta = {
  component: Message,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <MessageContent>
        <Bubble variant="muted">
          <BubbleContent>Hi! How can I help you today?</BubbleContent>
        </Bubble>
      </MessageContent>
    ),
  },
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Hi! How can I help you today?')).toBeVisible();
  },
};

export const AlignedEnd: Story = {
  args: {
    align: 'end',
    children: (
      <MessageContent>
        <Bubble>
          <BubbleContent>Show me last week&apos;s signups.</BubbleContent>
        </Bubble>
      </MessageContent>
    ),
  },
};

export const WithAvatarHeaderAndFooter: Story = {
  args: {
    children: (
      <>
        <MessageAvatar>
          <Avatar>
            {/* 텍스트 fallback 은 Avatar 의 muted 대비 문제(4.34:1)로 a11y 실패 — 아이콘 사용, 보고 참고 */}
            <AvatarFallback>
              <BotIcon className="size-4 text-foreground" aria-hidden />
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Assistant</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>Signups grew 18% week over week.</BubbleContent>
          </Bubble>
          <MessageFooter>
            <time dateTime="2026-10-14T10:24:00Z">Oct 14, 2026, 10:24 AM</time>
          </MessageFooter>
        </MessageContent>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Assistant')).toBeVisible();
    await expect(canvas.getByText('Oct 14, 2026, 10:24 AM')).toBeVisible();
  },
};

export const WithLongText: Story = {
  args: {
    children: (
      <MessageContent>
        <Bubble variant="muted">
          <BubbleContent>
            Here is a detailed summary of the quarterly metrics including revenue, churn, and
            activation across every region, which should wrap inside the message.
            Averyveryverylongidentifierwithoutspaces_that_should_break_instead_of_overflowing.
          </BubbleContent>
        </Bubble>
      </MessageContent>
    ),
  },
};

export const Conversation: Story = {
  render: () => (
    <MessageGroup>
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>Can you summarize the last report?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            {/* 텍스트 fallback 은 Avatar 의 muted 대비 문제(4.34:1)로 a11y 실패 — 아이콘 사용, 보고 참고 */}
            <AvatarFallback>
              <BotIcon className="size-4 text-foreground" aria-hidden />
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>Sure — revenue grew 12% over the previous quarter.</BubbleContent>
          </Bubble>
          <Bubble variant="muted">
            <BubbleContent>Churn stayed flat at 2.1%.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>Thanks!</BubbleContent>
          </Bubble>
          <MessageFooter>Read</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Can you summarize the last report?')).toBeVisible();
    await expect(canvas.getByText('Churn stayed flat at 2.1%.')).toBeVisible();
    await expect(canvas.getByText('Read')).toBeVisible();
  },
};
