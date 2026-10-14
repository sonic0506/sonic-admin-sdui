import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEventHandler } from 'react';
import { FileTextIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from './attachment';
import { Spinner } from './spinner';

// 네트워크 이미지 대신 인라인 SVG 를 쓴다 (결정성)
const PREVIEW_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%2394a3b8'/><circle cx='28' cy='28' r='10' fill='%23e2e8f0'/><path d='M0 80 L30 45 L50 65 L65 50 L80 80 Z' fill='%23475569'/></svg>";

const fileContent = (title: string, description: string) => (
  <AttachmentContent>
    <AttachmentTitle>{title}</AttachmentTitle>
    <AttachmentDescription>{description}</AttachmentDescription>
  </AttachmentContent>
);

const meta = {
  component: Attachment,
  tags: ['ai-generated'],
  args: {
    children: (
      <>
        <AttachmentMedia>
          <FileTextIcon />
        </AttachmentMedia>
        {fileContent('quarterly-report.pdf', 'PDF · 2.4 MB')}
      </>
    ),
  },
} satisfies Meta<typeof Attachment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('quarterly-report.pdf')).toBeVisible();
    await expect(canvas.getByText('PDF · 2.4 MB')).toBeVisible();
  },
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Attachment {...args} state="idle">
        <AttachmentMedia>
          <FileTextIcon />
        </AttachmentMedia>
        {fileContent('draft.docx', 'Ready to upload')}
      </Attachment>
      <Attachment {...args} state="uploading">
        <AttachmentMedia>
          <Spinner />
        </AttachmentMedia>
        {fileContent('invoice-2026-10.pdf', 'Uploading… 42%')}
      </Attachment>
      <Attachment {...args} state="processing">
        <AttachmentMedia>
          <Spinner aria-label="Processing" />
        </AttachmentMedia>
        {fileContent('dataset.csv', 'Processing…')}
      </Attachment>
      <Attachment {...args} state="error">
        <AttachmentMedia>
          <TriangleAlertIcon />
        </AttachmentMedia>
        {fileContent('archive.zip', 'File exceeds 25 MB limit')}
      </Attachment>
      <Attachment {...args} state="done">
        <AttachmentMedia>
          <FileTextIcon />
        </AttachmentMedia>
        {fileContent('quarterly-report.pdf', 'PDF · 2.4 MB')}
      </Attachment>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Loading' })).toBeVisible();
    await expect(canvas.getByRole('status', { name: 'Processing' })).toBeVisible();
    await expect(canvas.getByText('File exceeds 25 MB limit')).toBeVisible();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['default', 'sm', 'xs'] as const).map((size) => (
        <Attachment {...args} key={size} size={size}>
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          {fileContent(`size-${size}.pdf`, 'PDF · 2.4 MB')}
        </Attachment>
      ))}
    </div>
  ),
};

export const VerticalWithImage: Story = {
  args: {
    orientation: 'vertical',
    children: (
      <>
        <AttachmentMedia variant="image">
          <img src={PREVIEW_IMAGE} alt="Mountain landscape preview" />
        </AttachmentMedia>
        {fileContent('landscape.png', 'PNG · 820 KB')}
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Mountain landscape preview' })).toBeVisible();
  },
};

export const WithLongFileName: Story = {
  args: {
    className: 'w-56',
    children: (
      <>
        <AttachmentMedia>
          <FileTextIcon />
        </AttachmentMedia>
        {fileContent(
          'annual-financial-statement-final-revised-v3-approved-by-board.pdf',
          'PDF · 12.8 MB · uploaded by finance team',
        )}
      </>
    ),
  },
};

export const RemoveAction: Story = {
  args: {
    // 콜백 검증용 — Attachment 자체 prop 이 아니라 액션 버튼에 전달된다
    onClick: fn(),
  },
  render: ({ onClick, ...args }) => (
    <Attachment {...args}>
      <AttachmentMedia>
        <FileTextIcon />
      </AttachmentMedia>
      {fileContent('quarterly-report.pdf', 'PDF · 2.4 MB')}
      <AttachmentActions>
        <AttachmentAction
          aria-label="Remove quarterly-report.pdf"
          onClick={onClick as MouseEventHandler}
        >
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remove quarterly-report.pdf' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const OpenWithTrigger: Story = {
  args: { onClick: fn() },
  render: ({ onClick, ...args }) => (
    <Attachment {...args}>
      <AttachmentTrigger
        aria-label="Open quarterly-report.pdf"
        onClick={onClick as MouseEventHandler}
      />
      <AttachmentMedia>
        <FileTextIcon />
      </AttachmentMedia>
      {fileContent('quarterly-report.pdf', 'PDF · 2.4 MB')}
    </Attachment>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Open quarterly-report.pdf' });
    await userEvent.click(trigger);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveFocus();
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Group: Story = {
  render: (args) => (
    // AttachmentGroup 은 가로 스크롤 영역인데 기본으로 포커스를 받지 않아(scrollable-region-focusable),
    // 스토리에서 region 역할·이름·tabIndex 를 부여해 키보드 접근을 보장한다 (보고 참고)
    <AttachmentGroup className="max-w-md" role="region" aria-label="Attached files" tabIndex={0}>
      {['brief.pdf', 'budget.xlsx', 'timeline.pptx', 'notes.txt', 'contract.docx'].map((name) => (
        <Attachment {...args} key={name}>
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          {fileContent(name, 'Uploaded Oct 14, 2026')}
        </Attachment>
      ))}
    </AttachmentGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('region', { name: 'Attached files' });
    await expect(canvas.getByText('brief.pdf')).toBeVisible();
    await expect(canvas.getByText('contract.docx')).toBeInTheDocument();
    await userEvent.tab();
    await expect(group).toHaveFocus();
  },
};
