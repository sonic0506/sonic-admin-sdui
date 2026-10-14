import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';

const panel = (label: string, defaultSize?: string) => (
  <ResizablePanel defaultSize={defaultSize}>
    <div className="flex h-full items-center justify-center p-6">
      <span className="font-semibold">{label}</span>
    </div>
  </ResizablePanel>
);

const meta = {
  component: ResizablePanelGroup,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="h-[240px] w-[480px] rounded-lg border">
        <Story />
      </div>
    ),
  ],
  args: {
    onLayoutChanged: fn(),
    children: (
      <>
        {panel('Sidebar', '30')}
        <ResizableHandle aria-label="Resize sidebar" />
        {panel('Content', '70')}
      </>
    ),
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Sidebar')).toBeVisible();
    await expect(canvas.getByText('Content')).toBeVisible();
    await expect(canvas.getByRole('separator', { name: 'Resize sidebar' })).toHaveAttribute(
      'aria-valuenow',
      '30',
    );
  },
};

export const ResizeWithKeyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const handle = canvas.getByRole('separator', { name: 'Resize sidebar' });
    const initial = Number(handle.getAttribute('aria-valuenow'));

    await userEvent.tab();
    await expect(handle).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(initial),
    );
    await waitFor(() => expect(args.onLayoutChanged).toHaveBeenCalled());

    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(Number(handle.getAttribute('aria-valuenow'))).toBe(initial));
  },
};

export const WithHandle: Story = {
  args: {
    children: (
      <>
        {panel('Sidebar', '30')}
        <ResizableHandle withHandle aria-label="Resize sidebar" />
        {panel('Content', '70')}
      </>
    ),
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    children: (
      <>
        {panel('Header', '25')}
        <ResizableHandle withHandle aria-label="Resize header" />
        {panel('Content', '75')}
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator', { name: 'Resize header' })).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
  },
};

export const Nested: Story = {
  args: {
    children: (
      <>
        {panel('Sidebar', '40')}
        <ResizableHandle aria-label="Resize sidebar" />
        <ResizablePanel defaultSize="60">
          <ResizablePanelGroup orientation="vertical">
            {panel('Editor', '70')}
            <ResizableHandle aria-label="Resize terminal" />
            {panel('Terminal', '30')}
          </ResizablePanelGroup>
        </ResizablePanel>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('separator')).toHaveLength(2);
  },
};
