import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { Button } from './button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

const meta = {
  component: Collapsible,
  tags: ['ai-generated'],
  args: {
    className: 'flex w-80 flex-col gap-2',
    onOpenChange: fn(),
    children: (
      <>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Advanced settings</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p>Enable verbose logging and custom webhooks.</p>
        </CollapsibleContent>
      </>
    ),
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Advanced settings' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.queryByText('Enable verbose logging and custom webhooks.'),
    ).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(
      await canvas.findByText('Enable verbose logging and custom webhooks.'),
    ).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(
        canvas.queryByText('Enable verbose logging and custom webhooks.'),
      ).not.toBeInTheDocument(),
    );
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const DefaultOpen: Story = {
  args: { defaultOpen: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Advanced settings' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByText('Enable verbose logging and custom webhooks.')).toBeVisible();
  },
};

export const KeyboardToggle: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Advanced settings' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Advanced settings' });
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // 비활성 트리거는 포커스되지 않아 키보드로도 열 수 없다
    await userEvent.tab();
    await expect(trigger).not.toHaveFocus();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};
