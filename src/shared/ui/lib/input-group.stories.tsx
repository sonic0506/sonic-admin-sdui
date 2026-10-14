import type * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowUp, Search, X } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group';

// 그룹 안 버튼의 클릭을 spy 로 검증하기 위한 스토리 전용 arg (div 에는 전달하지 않는다)
type StoryArgs = React.ComponentProps<typeof InputGroup> & { onAction?: () => void };

const meta = {
  component: InputGroup,
  tags: ['ai-generated'],
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Search" placeholder="Search..." />
      <InputGroupAddon>
        <Search aria-hidden />
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Search' });
    await userEvent.type(input, 'orders');
    await expect(input).toHaveValue('orders');
  },
};

export const ClickAddonFocusesInput: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Website" placeholder="example" />
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('.com'));
    await expect(canvas.getByRole('textbox', { name: 'Website' })).toHaveFocus();
  },
};

export const WithButton: Story = {
  args: { onAction: fn() },
  render: ({ onAction, ...args }) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Keyword" defaultValue="invoice" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Clear keyword" onClick={onAction}>
          <X />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Clear keyword' });
    await userEvent.click(button);
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    // 애드온 안의 버튼을 누르면 입력창으로 포커스를 옮기지 않는다
    await expect(button).toHaveFocus();
  },
};

export const WithTextareaAndBlockAddon: Story = {
  args: { onAction: fn() },
  render: ({ onAction, ...args }) => (
    <InputGroup {...args}>
      <InputGroupTextarea aria-label="Message" placeholder="Write a message..." />
      <InputGroupAddon align="block-end">
        <InputGroupText>0 / 200</InputGroupText>
        <InputGroupButton
          size="icon-xs"
          variant="default"
          className="ml-auto"
          aria-label="Send"
          onClick={onAction}
        >
          <ArrowUp />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.type(textarea, 'Hello');
    await expect(textarea).toHaveValue('Hello');
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

export const Invalid: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Email" aria-invalid defaultValue="not-an-email" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>@example.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeInvalid();
  },
};

export const Disabled: Story = {
  args: { onAction: fn() },
  render: ({ onAction, ...args }) => (
    <InputGroup {...args} data-disabled="true">
      <InputGroupInput aria-label="Search" disabled />
      <InputGroupAddon align="inline-end">
        <InputGroupButton aria-label="Run search" disabled onClick={onAction}>
          <Search />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Search' });
    const button = canvas.getByRole('button', { name: 'Run search' });
    await expect(input).toBeDisabled();
    await expect(button).toBeDisabled();
    // disabled 스타일이 pointer-events:none 이라 user-event 기본 검사를 끄고 실제 클릭을 시도한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(button);
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};
