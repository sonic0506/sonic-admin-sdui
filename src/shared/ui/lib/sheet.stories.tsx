import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { Button } from './button';
import { Input } from './input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta = {
  component: Sheet,
  tags: ['ai-generated'],
  args: { onOpenChange: fn() },
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow down the list of orders.</SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <Input aria-label="Customer" placeholder="Customer name" />
        </div>
        <SheetFooter>
          <Button>Apply</Button>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Open filters' });

    await userEvent.click(trigger);
    const sheet = await body.findByRole('dialog', { name: 'Filters' });
    await expect(sheet).toHaveAccessibleDescription('Narrow down the list of orders.');
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await waitFor(() =>
      expect(within(sheet).getByRole('textbox', { name: 'Customer' })).toHaveFocus(),
    );

    await userEvent.click(within(sheet).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger).toHaveFocus();
  },
};

export const ClosesWithEscape: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Open filters' });

    await userEvent.click(trigger);
    await body.findByRole('dialog', { name: 'Filters' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const ClosesOnOutsideClick: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Open filters' }));
    await body.findByRole('dialog', { name: 'Filters' });
    // 모달이 body 에 pointer-events:none 을 걸므로 기본 검사를 끄고 바깥을 클릭한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(canvasElement);
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const ClosesWithFooterButton: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Open filters' }));
    const sheet = await body.findByRole('dialog', { name: 'Filters' });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const Sides: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Sheet {...args} key={side}>
          <SheetTrigger asChild>
            <Button variant="outline">Open {side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Sheet from {side}</SheetTitle>
              <SheetDescription>Slides in from the {side} edge.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Open left' }));
    const sheet = await body.findByRole('dialog', { name: 'Sheet from left' });
    await waitFor(() => expect(sheet).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const WithoutCloseIcon: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Sheet {...args}>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Processing</SheetTitle>
          <SheetDescription>Use the button below when you are done.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const sheet = await body.findByRole('dialog', { name: 'Processing' });
    await expect(within(sheet).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    // fade-in 애니메이션(opacity 0 시작)이 끝날 때까지 기다린다
    await waitFor(() => expect(within(sheet).getByRole('button', { name: 'Done' })).toBeVisible());
  },
};
