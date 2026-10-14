import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { Button } from './button';
import { Input } from './input';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './popover';

const meta = {
  component: Popover,
  tags: ['ai-generated'],
  args: { onOpenChange: fn() },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Dimensions">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <Input aria-label="Width" defaultValue="100%" />
      </PopoverContent>
    </Popover>
  ),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Dimensions' });

    await userEvent.click(trigger);
    const popover = await body.findByRole('dialog', { name: 'Dimensions' });
    await expect(
      within(popover).getByText('Set the dimensions for the layer.'),
    ).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await waitFor(() =>
      expect(within(popover).getByRole('textbox', { name: 'Width' })).toHaveFocus(),
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger).toHaveFocus();
  },
};

export const ClosesOnOutsideClick: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Dimensions' }));
    await body.findByRole('dialog', { name: 'Dimensions' });
    await userEvent.click(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const TogglesWithTrigger: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Dimensions' });

    await userEvent.click(trigger);
    await body.findByRole('dialog', { name: 'Dimensions' });
    await userEvent.click(trigger);
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const AlignedStart: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Share</Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" aria-label="Share">
        <p>Anyone with the link can view this document.</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popover = await body.findByRole('dialog', { name: 'Share' });
    await expect(
      within(popover).getByText('Anyone with the link can view this document.'),
    ).toBeInTheDocument();
  },
};
