import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { Button } from './button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';

const meta = {
  component: Drawer,
  tags: ['ai-generated'],
  args: { onOpenChange: fn() },
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Set goal</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Daily goal</DrawerTitle>
          <DrawerDescription>Set your daily activity goal.</DrawerDescription>
        </DrawerHeader>
        <p className="px-4 text-center text-4xl font-bold">350 kcal</p>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Set goal' });

    await userEvent.click(trigger);
    const drawer = await body.findByRole('dialog', { name: 'Daily goal' });
    await expect(drawer).toHaveAccessibleDescription('Set your daily activity goal.');
    await expect(within(drawer).getByText('350 kcal')).toBeInTheDocument();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

// vaul 은 기본값(autoFocus=false)에서 열릴 때 포커스를 옮기지 않는다 — 켜면 첫 포커스 가능 요소로 이동
export const AutoFocus: Story = {
  args: { autoFocus: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Set goal' }));
    const drawer = await body.findByRole('dialog', { name: 'Daily goal' });
    await waitFor(() =>
      expect(within(drawer).getByRole('button', { name: 'Submit' })).toHaveFocus(),
    );
  },
};

export const ClosesWithEscape: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Set goal' }));
    await body.findByRole('dialog', { name: 'Daily goal' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const ClosesOnOutsideClick: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Set goal' }));
    await body.findByRole('dialog', { name: 'Daily goal' });
    // 모달이 body 에 pointer-events:none 을 걸므로 기본 검사를 끄고 바깥을 클릭한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(canvasElement);
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const FromRight: Story = {
  args: { direction: 'right', defaultOpen: true },
  render: (args) => (
    <Drawer {...args}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
          <DrawerDescription>You have 3 unread messages.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const drawer = await body.findByRole('dialog', { name: 'Notifications' });
    await expect(within(drawer).getByRole('button', { name: 'Close' })).toBeInTheDocument();
  },
};
