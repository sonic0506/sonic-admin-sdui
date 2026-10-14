import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check } from 'lucide-react';
import { expect } from 'storybook/test';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from './avatar';

// 네트워크 없이 결정적으로 로드되는 로컬 data URI 이미지
const AVATAR_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#6366f1"/><circle cx="32" cy="26" r="12" fill="#e0e7ff"/><rect x="14" y="42" width="36" height="22" rx="11" fill="#e0e7ff"/></svg>',
  );

const meta = {
  component: Avatar,
  tags: ['ai-generated'],
  args: {
    children: <AvatarFallback>JD</AvatarFallback>,
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('JD')).toBeVisible();
  },
};

export const WithImage: Story = {
  args: {
    children: (
      <>
        <AvatarImage src={AVATAR_SRC} alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('img', { name: 'Jane Doe' })).toBeVisible();
    await expect(canvas.queryByText('JD')).not.toBeInTheDocument();
  },
};

export const FallbackWhenImageFails: Story = {
  args: {
    children: (
      <>
        {/* 잘못된 data URI 라 네트워크 없이 즉시 로드 실패한다 */}
        <AvatarImage src="data:image/png;base64,invalid" alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('JD')).toBeVisible();
    await expect(canvas.queryByRole('img', { name: 'Jane Doe' })).not.toBeInTheDocument();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Avatar {...args} key={size} size={size}>
          <AvatarFallback>{size.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const WithBadge: Story = {
  args: {
    size: 'lg',
    children: (
      <>
        <AvatarFallback>JD</AvatarFallback>
        <AvatarBadge>
          <Check aria-hidden />
          <span className="sr-only">Online</span>
        </AvatarBadge>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Online')).toBeInTheDocument();
  },
};

export const Group: Story = {
  render: (args) => (
    <AvatarGroup>
      {['AL', 'BK', 'CM'].map((initials) => (
        <Avatar {...args} key={initials}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('AL')).toBeVisible();
    await expect(canvas.getByText('+5')).toBeVisible();
  },
};
