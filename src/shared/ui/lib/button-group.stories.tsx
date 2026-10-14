import type * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { Button } from './button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group';
import { Input } from './input';

// 그룹 안 버튼 클릭을 spy 로 검증하기 위한 스토리 전용 arg (div 에는 전달하지 않는다)
type StoryArgs = React.ComponentProps<typeof ButtonGroup> & { onAction?: (label: string) => void };

const meta = {
  component: ButtonGroup,
  tags: ['ai-generated'],
  args: { 'aria-label': 'Text alignment', onAction: fn() },
  render: ({ onAction, ...args }) => (
    <ButtonGroup {...args}>
      {['Left', 'Center', 'Right'].map((label) => (
        <Button key={label} variant="outline" onClick={() => onAction?.(label)}>
          {label}
        </Button>
      ))}
    </ButtonGroup>
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Text alignment' });
    await expect(group).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Center' }));
    await expect(args.onAction).toHaveBeenCalledWith('Center');
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Left' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Center' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onAction).toHaveBeenCalledWith('Center');
  },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(3);
  },
};

export const WithTextAndSeparator: Story = {
  args: { 'aria-label': 'Quantity' },
  render: ({ onAction, ...args }) => (
    <ButtonGroup {...args}>
      <Button variant="secondary" aria-label="Decrease" onClick={() => onAction?.('decrease')}>
        <Minus />
      </Button>
      <ButtonGroupSeparator />
      <ButtonGroupText>12 items</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant="secondary" aria-label="Increase" onClick={() => onAction?.('increase')}>
        <Plus />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText('12 items')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Increase' }));
    await expect(args.onAction).toHaveBeenCalledWith('increase');
  },
};

export const WithInput: Story = {
  args: { 'aria-label': 'Search orders' },
  render: ({ onAction, ...args }) => (
    <ButtonGroup {...args}>
      <Input aria-label="Order number" placeholder="Order #" />
      <Button variant="outline" onClick={() => onAction?.('search')}>
        Search
      </Button>
    </ButtonGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: 'Order number' }), '1024');
    await userEvent.click(canvas.getByRole('button', { name: 'Search' }));
    await expect(args.onAction).toHaveBeenCalledWith('search');
  },
};

export const NestedGroups: Story = {
  args: { 'aria-label': 'Editor toolbar' },
  render: ({ onAction, ...args }) => (
    <ButtonGroup {...args}>
      <ButtonGroup aria-label="History">
        <Button variant="outline" onClick={() => onAction?.('undo')}>
          Undo
        </Button>
        <Button variant="outline" onClick={() => onAction?.('redo')}>
          Redo
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Save actions">
        <Button variant="outline" onClick={() => onAction?.('save')}>
          Save
        </Button>
        <Button variant="outline" aria-label="More save options" onClick={() => onAction?.('more')}>
          <ChevronDown />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('group', { name: 'History' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'More save options' }));
    await expect(args.onAction).toHaveBeenCalledWith('more');
  },
};
