import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { Card, CardContent } from './card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel';

const SLIDES = [1, 2, 3, 4, 5];

const slides = (itemClassName?: string) =>
  SLIDES.map((n) => (
    <CarouselItem key={n} aria-label={`${n} of ${SLIDES.length}`} className={itemClassName}>
      <Card>
        <CardContent className="flex aspect-square items-center justify-center p-6">
          <span className="text-4xl font-semibold">Slide {n}</span>
        </CardContent>
      </Card>
    </CarouselItem>
  ));

const meta = {
  component: Carousel,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-xs px-12 py-12">
        <Story />
      </div>
    ),
  ],
  args: {
    'aria-label': 'Featured products',
    setApi: fn(),
    children: (
      <>
        <CarouselContent>{slides()}</CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </>
    ),
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Featured products' })).toBeVisible();
    await expect(canvas.getAllByRole('group')).toHaveLength(SLIDES.length);
    await waitFor(() => expect(args.setApi).toHaveBeenCalled());
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Next slide' })).toBeEnabled());
    await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
  },
};

export const NavigateWithButtons: Story = {
  play: async ({ canvas, userEvent }) => {
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await waitFor(() => expect(next).toBeEnabled());

    await userEvent.click(next);
    await waitFor(() => expect(prev).toBeEnabled());

    for (let i = 1; i < SLIDES.length - 1; i++) {
      await userEvent.click(next);
    }
    // 마지막 슬라이드에 도달하면 다음 버튼이 비활성화된다
    await waitFor(() => expect(next).toBeDisabled());

    await userEvent.click(prev);
    await waitFor(() => expect(next).toBeEnabled());
  },
};

export const NavigateWithKeyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await waitFor(() => expect(next).toBeEnabled());

    // 이전 버튼은 비활성이라 첫 탭 정지는 다음 버튼
    await userEvent.tab();
    await expect(next).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(prev).toBeEnabled());

    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(prev).toBeDisabled());
  },
};

export const Loop: Story = {
  args: { opts: { loop: true } },
  play: async ({ canvas }) => {
    // loop 이면 첫 슬라이드에서도 이전으로 이동할 수 있다
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeEnabled(),
    );
  },
};

export const MultipleSlidesPerView: Story = {
  args: {
    children: (
      <>
        <CarouselContent>{slides('basis-1/2')}</CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </>
    ),
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    opts: { align: 'start' },
    children: (
      <>
        <CarouselContent className="h-[260px]">{slides('basis-1/2')}</CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await waitFor(() => expect(next).toBeEnabled());
    await userEvent.click(next);
    await waitFor(() => expect(prev).toBeEnabled());
  },
};
