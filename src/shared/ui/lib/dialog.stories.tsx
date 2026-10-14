import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Input } from './input';

const meta = {
  component: Dialog,
  tags: ['ai-generated'],
  args: { onOpenChange: fn() },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile and save when done.</DialogDescription>
        </DialogHeader>
        <Input aria-label="Name" defaultValue="Pedro Duarte" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit profile' });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Edit profile' });
    await expect(dialog).toHaveAccessibleDescription(
      'Make changes to your profile and save when done.',
    );
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    // 포커스가 다이얼로그 안(첫 포커스 가능 요소)으로 이동한다
    await waitFor(() =>
      expect(within(dialog).getByRole('textbox', { name: 'Name' })).toHaveFocus(),
    );

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger).toHaveFocus();
  },
};

export const ClosesWithEscape: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit profile' });

    await userEvent.click(trigger);
    await body.findByRole('dialog', { name: 'Edit profile' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const ClosesOnOutsideClick: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }));
    await body.findByRole('dialog', { name: 'Edit profile' });
    // 모달이 열리면 body 에 pointer-events:none 이 걸리므로 기본 검사를 끄고 바깥을 클릭한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(canvasElement);
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const ClosesWithFooterButton: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }));
    const dialog = await body.findByRole('dialog', { name: 'Edit profile' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const WithoutCloseIcon: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Dialog {...args}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Session expired</DialogTitle>
          <DialogDescription>Please sign in again to continue.</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'Session expired' });
    // 아이콘 닫기 버튼 대신 footer 의 텍스트 Close 버튼 하나만 있다
    const closeButtons = within(dialog).getAllByRole('button', { name: 'Close' });
    await expect(closeButtons).toHaveLength(1);
    await userEvent.click(closeButtons[0]);
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const WithLongContent: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Dialog {...args}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Read the full terms before continuing.</DialogDescription>
        </DialogHeader>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>
            Section {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'Terms of service' });
    await expect(within(dialog).getByText(/^Section 12\./)).toBeInTheDocument();
  },
};
