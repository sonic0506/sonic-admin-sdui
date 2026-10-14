import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Separator } from './separator';

const meta = {
  component: Separator,
  tags: ['ai-generated'],
  // radix 타입은 propFilter 로 제외되어 컨트롤이 생성되지 않음. 값은 radix Separator 의 Orientation 에서 옮김
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80 text-sm">
      <p>Account</p>
      <Separator {...args} className="my-2" />
      <p>Billing</p>
    </div>
  ),
  play: async ({ canvas }) => {
    // decorative(기본값)이면 보조기술에 노출되지 않는다
    await expect(canvas.queryByRole('separator')).not.toBeInTheDocument();
  },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div className="flex h-5 items-center gap-2 text-sm">
      <span>Docs</span>
      <Separator {...args} />
      <span>Source</span>
    </div>
  ),
};

export const Semantic: Story = {
  args: { decorative: false },
  render: Default.render,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toBeInTheDocument();
  },
};

export const SemanticVertical: Story = {
  args: { decorative: false, orientation: 'vertical' },
  render: Vertical.render,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  },
};
