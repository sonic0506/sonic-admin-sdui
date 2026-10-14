import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from './native-select';

const meta = {
  component: NativeSelect,
  tags: ['ai-generated'],
  args: {
    'aria-label': 'Status',
    onChange: fn(),
    children: (
      <>
        <NativeSelectOption value="">Select status</NativeSelectOption>
        <NativeSelectOption value="todo">Todo</NativeSelectOption>
        <NativeSelectOption value="in-progress">In progress</NativeSelectOption>
        <NativeSelectOption value="done">Done</NativeSelectOption>
      </>
    ),
  },
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Status' });
    await expect(select).toHaveValue('');
    await userEvent.selectOptions(select, 'In progress');
    await expect(select).toHaveValue('in-progress');
    await expect(canvas.getByRole('option', { name: 'In progress' })).toHaveProperty(
      'selected',
      true,
    );
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const WithDefaultValue: Story = {
  args: { defaultValue: 'done' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toHaveValue('done');
  },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const WithOptionGroups: Story = {
  args: {
    'aria-label': 'Department',
    children: (
      <>
        <NativeSelectOptGroup label="Engineering">
          <NativeSelectOption value="frontend">Frontend</NativeSelectOption>
          <NativeSelectOption value="backend">Backend</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Sales">
          <NativeSelectOption value="sales-team">Sales Team</NativeSelectOption>
        </NativeSelectOptGroup>
      </>
    ),
  },
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Department' });
    await expect(canvas.getByRole('group', { name: 'Engineering' })).toBeInTheDocument();
    await userEvent.selectOptions(select, 'backend');
    await expect(select).toHaveValue('backend');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Status' });
    await expect(select).toBeDisabled();
    // disabled 스타일이 pointer-events:none 이라 user-event 기본 검사를 끄고 실제 선택을 시도한다
    await userEvent.setup({ pointerEventsCheck: 0 }).selectOptions(select, 'done');
    await expect(select).toHaveValue('');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toBeInvalid();
  },
};
