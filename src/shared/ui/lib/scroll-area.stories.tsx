import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ScrollArea, ScrollBar } from './scroll-area';

const TAGS = Array.from({ length: 50 }, (_, i) => `v1.2.0-beta.${50 - i}`);
const WORKS = ['Ornella Binni', 'Tom Byrom', 'Vladimir Malyavko', 'Mona Eendra', 'Leo Rivas'];

const meta = {
  component: ScrollArea,
  tags: ['ai-generated'],
  args: {
    className: 'h-72 w-48 rounded-md border',
    children: (
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
        {/* Radix Viewport 는 tabIndex 가 없어 포커스 가능한 콘텐츠가 있어야 키보드로 스크롤된다 (보고 참고) */}
        {TAGS.map((tag) => (
          <a key={tag} href={`/releases/${tag}`} className="block border-b py-2 text-sm">
            {tag}
          </a>
        ))}
      </div>
    ),
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('link', { name: 'v1.2.0-beta.50' })).toBeVisible();
    await expect(canvas.getAllByRole('link')).toHaveLength(TAGS.length);

    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'v1.2.0-beta.50' })).toHaveFocus();
  },
};

export const Horizontal: Story = {
  args: {
    className: 'w-96 rounded-md border whitespace-nowrap',
    children: (
      <>
        <div className="flex w-max gap-4 p-4">
          {WORKS.map((artist) => (
            <a key={artist} href={`/artists/${artist}`} className="shrink-0">
              <figure>
                <div className="flex h-40 w-36 items-center justify-center rounded-md bg-muted text-sm text-foreground">
                  Artwork
                </div>
                <figcaption className="pt-2 text-xs text-muted-foreground">
                  Photo by <span className="font-semibold text-foreground">{artist}</span>
                </figcaption>
              </figure>
            </a>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Ornella Binni')).toBeVisible();
    await expect(canvas.getAllByRole('link')).toHaveLength(WORKS.length);
  },
};

export const ShortContent: Story = {
  args: {
    children: <p className="p-4 text-sm">Only a single line — nothing to scroll.</p>,
  },
};
