import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { Bubble, BubbleContent } from './bubble';
import { Message, MessageContent } from './message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from './message-scroller';

const MESSAGES = Array.from({ length: 16 }, (_, i) => ({
  id: `m${i + 1}`,
  role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
  text:
    i % 2 === 0
      ? `Question ${i / 2 + 1}: how did metric ${i / 2 + 1} change this week?`
      : `Answer ${(i + 1) / 2}: metric ${(i + 1) / 2} rose by ${(i + 1) * 3}% compared to last week.`,
}));

type Msg = (typeof MESSAGES)[number];

const thread = (messages: Msg[]) => (
  <>
    <MessageScrollerViewport>
      <MessageScrollerContent className="p-4">
        {messages.map((m) => (
          <MessageScrollerItem key={m.id} messageId={m.id}>
            <Message align={m.role === 'user' ? 'end' : 'start'}>
              <MessageContent>
                <Bubble variant={m.role === 'user' ? 'default' : 'muted'}>
                  <BubbleContent>{m.text}</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          </MessageScrollerItem>
        ))}
      </MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton direction="start" behavior="auto" />
    <MessageScrollerButton direction="end" behavior="auto" />
  </>
);

const meta = {
  component: MessageScroller,
  tags: ['ai-generated'],
  // MessageScroller 는 Provider 컨텍스트가 필수다
  decorators: [
    (Story) => (
      <div className="h-[360px] w-full max-w-md rounded-lg border">
        <MessageScrollerProvider>
          <Story />
        </MessageScrollerProvider>
      </div>
    ),
  ],
  args: { children: thread(MESSAGES) },
} satisfies Meta<typeof MessageScroller>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const viewport = canvas.getByRole('region', { name: 'Messages' });
    await expect(canvas.getByRole('log')).toBeInTheDocument();
    // 기본 스크롤 위치는 끝 — 마지막 메시지가 보이고 맨 위로 이동 버튼만 활성화된다
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
    await expect(canvas.getByText(MESSAGES.at(-1)!.text)).toBeVisible();
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Scroll to start' })).not.toHaveAttribute('inert'),
    );
    await expect(canvas.getByRole('button', { name: 'Scroll to end' })).toHaveAttribute('inert');
  },
};

export const ScrollToStartAndEnd: Story = {
  play: async ({ canvas, userEvent }) => {
    const viewport = canvas.getByRole('region', { name: 'Messages' });
    const toStart = canvas.getByRole('button', { name: 'Scroll to start' });
    const toEnd = canvas.getByRole('button', { name: 'Scroll to end' });

    await waitFor(() => expect(toStart).not.toHaveAttribute('inert'));
    await userEvent.click(toStart);
    await waitFor(() => expect(viewport.scrollTop).toBe(0));
    await waitFor(() => expect(toEnd).not.toHaveAttribute('inert'));

    await userEvent.click(toEnd);
    await waitFor(() =>
      expect(viewport.scrollTop + viewport.clientHeight).toBeGreaterThanOrEqual(
        viewport.scrollHeight - 1,
      ),
    );
  },
};

export const StartAtTop: Story = {
  decorators: [
    (Story) => (
      <div className="h-[360px] w-full max-w-md rounded-lg border">
        <MessageScrollerProvider defaultScrollPosition="start">
          <Story />
        </MessageScrollerProvider>
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const viewport = canvas.getByRole('region', { name: 'Messages' });
    await expect(viewport.scrollTop).toBe(0);
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Scroll to end' })).not.toHaveAttribute('inert'),
    );
  },
};

export const SingleMessage: Story = {
  args: { children: thread(MESSAGES.slice(0, 1)) },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(MESSAGES[0].text)).toBeVisible();
    // 스크롤할 내용이 없으면 두 버튼 모두 비활성(inert)
    await expect(canvas.getByRole('button', { name: 'Scroll to start' })).toHaveAttribute('inert');
    await expect(canvas.getByRole('button', { name: 'Scroll to end' })).toHaveAttribute('inert');
  },
};

export const Empty: Story = {
  args: { children: thread([]) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('log')).toBeInTheDocument();
    await expect(canvas.queryByText(MESSAGES[0].text)).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Scroll to end' })).toHaveAttribute('inert');
  },
};
