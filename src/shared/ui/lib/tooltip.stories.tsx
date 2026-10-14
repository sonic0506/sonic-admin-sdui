import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon } from 'lucide-react';
import { expect, fn, waitFor, within } from 'storybook/test';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const meta = {
  component: Tooltip,
  tags: ['ai-generated'],
  args: { onOpenChange: fn() },
  // Radix Tooltip 은 Provider 안에서만 동작한다 (TooltipProvider 기본 delayDuration=0)
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Add to library">
          <PlusIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Add to library' });

    await userEvent.hover(trigger);
    const tooltip = await body.findByRole('tooltip');
    await expect(tooltip).toHaveTextContent('Add to library');
    await expect(trigger).toHaveAccessibleDescription('Add to library');
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);

    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const OpensOnKeyboardFocus: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Add to library' })).toHaveFocus();
    await expect(await body.findByRole('tooltip')).toHaveTextContent('Add to library');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Add to library' })).toHaveFocus();
  },
};

export const OnSide: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent side="right">Shown on the right</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('tooltip')).toHaveTextContent('Shown on the right');
  },
};

export const WithLongText: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Billing</Button>
      </TooltipTrigger>
      <TooltipContent>
        Charges are calculated at the end of each billing cycle and include all usage recorded up to
        that point.
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('tooltip')).toHaveTextContent(/end of each billing cycle/);
  },
};
