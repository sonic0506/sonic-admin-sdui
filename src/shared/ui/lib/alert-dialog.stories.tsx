import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrashIcon } from 'lucide-react';
import { expect, fn, waitFor, within } from 'storybook/test';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import { Button } from './button';

const meta = {
  component: AlertDialog,
  tags: ['ai-generated'],
  args: { onOpenChange: fn() },
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All files will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Delete project' });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('alertdialog', { name: 'Delete this project?' });
    await expect(dialog).toHaveAccessibleDescription(
      'This action cannot be undone. All files will be permanently removed.',
    );
    // 파괴적 동작 실수를 막기 위해 Cancel 에 초기 포커스가 간다
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus(),
    );

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger).toHaveFocus();
  },
};

export const ConfirmWithAction: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Delete project' }));
    const dialog = await body.findByRole('alertdialog', { name: 'Delete this project?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const ClosesWithEscape: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Delete project' });

    await userEvent.click(trigger);
    await body.findByRole('alertdialog', { name: 'Delete this project?' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const StaysOpenOnOutsideClick: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Delete project' }));
    const dialog = await body.findByRole('alertdialog', { name: 'Delete this project?' });
    // 모달이 body 에 pointer-events:none 을 걸므로 기본 검사를 끄고 바깥을 클릭한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(canvasElement);
    // AlertDialog 는 바깥 클릭으로 닫히지 않는다 — 명시적인 선택을 요구
    // (닫힘 애니메이션 중에도 DOM 에 남으므로 닫힘 요청 콜백 여부로 확인)
    await expect(args.onOpenChange).not.toHaveBeenCalledWith(false);
    // fade-in 애니메이션(opacity 0 시작)이 끝날 때까지 기다린다
    await waitFor(() => expect(dialog).toBeVisible());
  },
};

export const SmallWithMedia: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TrashIcon aria-hidden />
          </AlertDialogMedia>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>They will lose access immediately.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Remove</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('alertdialog', { name: 'Remove member?' });
    // fade-in 애니메이션(opacity 0 시작)이 끝날 때까지 기다린다
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Keep' })).toBeVisible());
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Remove' })).toBeVisible(),
    );
  },
};
