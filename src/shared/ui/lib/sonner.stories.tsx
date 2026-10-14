import type { Meta, StoryObj } from '@storybook/react-vite';
import { toast } from 'sonner';
import { expect, screen, waitFor } from 'storybook/test';
import { Button } from './button';
import { Toaster } from './sonner';

// next-themes 의 useTheme 은 ThemeProvider 가 없으면 기본값을 반환하므로 Provider 없이 렌더링된다
// 토스트는 마운트 직후 opacity:0 에서 페이드인하므로 toBeVisible 을 waitFor 로 재시도한다
const meta = {
  component: Toaster,
  tags: ['ai-generated'],
  // sonner 의 토스트 상태는 모듈 전역이라, 스토리 간에 남지 않도록 정리한다
  beforeEach: () => () => {
    toast.dismiss();
  },
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button variant="outline" onClick={() => toast('Event has been created')}>
        Show toast
      </Button>
    </>
  ),
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(screen.queryByText('Event has been created')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));
    await waitFor(() => expect(screen.getByText('Event has been created')).toBeVisible());
  },
};

export const DismissWithCloseButton: Story = {
  args: { closeButton: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));
    await waitFor(() => expect(screen.getByText('Event has been created')).toBeVisible());

    await userEvent.click(screen.getByRole('button', { name: 'Close toast' }));
    await waitFor(() =>
      expect(screen.queryByText('Event has been created')).not.toBeInTheDocument(),
    );
  },
};

export const Types: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast.success('Changes saved')}>
          Success
        </Button>
        <Button variant="outline" onClick={() => toast.info('New version available')}>
          Info
        </Button>
        <Button variant="outline" onClick={() => toast.warning('Storage almost full')}>
          Warning
        </Button>
        <Button variant="outline" onClick={() => toast.error('Upload failed')}>
          Error
        </Button>
      </div>
    </>
  ),
  // 기본 visibleToasts(3)면 4번째가 뜰 때 첫 토스트가 숨겨진다
  args: { expand: true, visibleToasts: 4 },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Success' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Info' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Warning' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Error' }));

    await waitFor(() => expect(screen.getByText('Changes saved')).toBeVisible());
    await waitFor(() => expect(screen.getByText('New version available')).toBeVisible());
    await waitFor(() => expect(screen.getByText('Storage almost full')).toBeVisible());
    await waitFor(() => expect(screen.getByText('Upload failed')).toBeVisible());
  },
};

export const WithDescription: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button
        variant="outline"
        onClick={() =>
          toast('Meeting scheduled', { description: 'Monday, October 19, 2026 at 9:00 AM' })
        }
      >
        Show toast
      </Button>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));
    await waitFor(() => expect(screen.getByText('Meeting scheduled')).toBeVisible());
    await expect(screen.getByText('Monday, October 19, 2026 at 9:00 AM')).toBeVisible();
  },
};

export const WithAction: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button
        variant="outline"
        onClick={() =>
          toast('File moved to trash', {
            action: { label: 'Undo', onClick: () => toast.success('File restored') },
          })
        }
      >
        Delete file
      </Button>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Delete file' }));
    await waitFor(() => expect(screen.getByText('File moved to trash')).toBeVisible());

    // 액션 버튼을 누르면 액션이 실행되고 원래 토스트는 닫힌다
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(screen.getByText('File restored')).toBeVisible());
    await waitFor(() => expect(screen.queryByText('File moved to trash')).not.toBeInTheDocument());
  },
};

export const TopCenter: Story = {
  args: { position: 'top-center' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));
    await waitFor(() => expect(screen.getByText('Event has been created')).toBeVisible());
  },
};
