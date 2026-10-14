import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { DirectionProvider, useDirection } from './direction';

function CurrentDirection() {
  const dir = useDirection();
  return <p dir={dir}>Direction: {dir}</p>;
}

const meta = {
  component: DirectionProvider,
  tags: ['ai-generated'],
  // dir 은 radix 타입상 필수라 기본값 ltr 을 지정한다
  args: { dir: 'ltr', children: <CurrentDirection /> },
  // Direction 타입이 radix 에서 와 컨트롤이 제대로 생성되지 않음. 값은 radix Direction ('ltr' | 'rtl')에서 옮김
  argTypes: {
    direction: { control: 'radio', options: ['ltr', 'rtl'] },
    dir: { control: 'radio', options: ['ltr', 'rtl'] },
  },
} satisfies Meta<typeof DirectionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Direction: ltr')).toBeVisible();
  },
};

export const RightToLeft: Story = {
  args: { direction: 'rtl' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Direction: rtl')).toHaveAttribute('dir', 'rtl');
  },
};

export const RightToLeftViaDir: Story = {
  args: { dir: 'rtl' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Direction: rtl')).toBeVisible();
  },
};

export const DirectionOverridesDir: Story = {
  args: { dir: 'rtl', direction: 'ltr' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Direction: ltr')).toBeVisible();
  },
};
