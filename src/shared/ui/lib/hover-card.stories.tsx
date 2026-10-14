import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const meta = {
  component: HoverCard,
  tags: ['ai-generated'],
  // 테스트가 지연 시간에 의존하지 않도록 열림/닫힘 지연을 없앤다
  args: { openDelay: 0, closeDelay: 0, onOpenChange: fn() },
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger asChild>
        <a href="https://github.com/vercel" className="underline">
          @vercel
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="font-medium">Vercel</p>
        <p>The React framework for the web.</p>
      </HoverCardContent>
    </HoverCard>
  ),
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('link', { name: '@vercel' });

    await userEvent.hover(trigger);
    await expect(await body.findByText('The React framework for the web.')).toBeInTheDocument();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);

    await userEvent.unhover(trigger);
    await waitFor(() =>
      expect(body.queryByText('The React framework for the web.')).not.toBeInTheDocument(),
    );
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const OpensOnKeyboardFocus: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: '@vercel' })).toHaveFocus();
    await expect(await body.findByText('The React framework for the web.')).toBeInTheDocument();

    await userEvent.tab();
    await waitFor(() =>
      expect(body.queryByText('The React framework for the web.')).not.toBeInTheDocument(),
    );
  },
};

export const ClosesWithEscape: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.hover(canvas.getByRole('link', { name: '@vercel' }));
    await body.findByText('The React framework for the web.');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByText('The React framework for the web.')).not.toBeInTheDocument(),
    );
  },
};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText('Vercel')).toBeInTheDocument();
  },
};
