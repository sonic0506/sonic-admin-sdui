import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

const meta = {
  component: Pagination,
  tags: ['ai-generated'],
  args: {
    children: (
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=10">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=3" />
        </PaginationItem>
      </PaginationContent>
    ),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('navigation', { name: 'pagination' })).toBeVisible();

    const current = canvas.getByRole('link', { name: '2' });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current');

    const prev = canvas.getByRole('link', { name: 'Go to previous page' });
    await expect(prev).toHaveAttribute('href', '?page=1');
    await expect(canvas.getByRole('link', { name: 'Go to next page' })).toHaveAttribute(
      'href',
      '?page=3',
    );

    await userEvent.tab();
    await expect(prev).toHaveFocus();
  },
};

export const FirstPage: Story = {
  args: {
    children: (
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="?page=1" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=2">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=2" />
        </PaginationItem>
      </PaginationContent>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: '1' })).toHaveAttribute('aria-current', 'page');
    await expect(
      canvas.queryByRole('link', { name: 'Go to previous page' }),
    ).not.toBeInTheDocument();
  },
};

// 보이는 텍스트를 바꾸면 기본 aria-label(영문)과 불일치(label-content-name-mismatch)하므로 aria-label 도 함께 지정한다
export const CustomLabels: Story = {
  args: {
    children: (
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=1" text="이전" aria-label="이전 페이지로 이동" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=3" text="다음" aria-label="다음 페이지로 이동" />
        </PaginationItem>
      </PaginationContent>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: '이전 페이지로 이동' })).toHaveTextContent(
      '이전',
    );
    await expect(canvas.getByRole('link', { name: '다음 페이지로 이동' })).toHaveTextContent(
      '다음',
    );
  },
};
