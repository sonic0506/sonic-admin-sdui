import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Calendar } from './calendar';

// 오늘 날짜에 의존하지 않도록 모든 스토리는 2026년 1월에 고정한다
const JAN_15 = new Date(2026, 0, 15);

const meta = {
  component: Calendar,
  tags: ['ai-generated'],
  args: { defaultMonth: JAN_15, today: JAN_15, onMonthChange: fn() },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Calendar props 는 mode 별 유니언이라 onSelect 타입이 좁혀지지 않아 spy 로만 꺼내 쓴다
const selectSpy = (args: object) => (args as { onSelect: unknown }).onSelect;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('grid', { name: 'January 2026' })).toBeVisible();
  },
};

export const SingleSelection: Story = {
  args: { mode: 'single', onSelect: fn() },
  // onSelect 를 넘기면 react-day-picker 가 controlled 로 동작하므로 선택 상태를 스토리에서 보관한다
  render: function SingleSelectionRender(args) {
    const [selected, setSelected] = useState<Date>();
    const onSelect = selectSpy(args) as (date: Date | undefined) => void;
    return (
      <Calendar
        {...args}
        mode="single"
        selected={selected}
        onSelect={(date) => {
          setSelected(date);
          onSelect(date);
        }}
      />
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /January 20th, 2026/ }));
    await expect(selectSpy(args)).toHaveBeenCalledWith(new Date(2026, 0, 20));
    // 선택 상태는 버튼이 아니라 day 셀(gridcell)의 aria-selected 로 노출된다
    await expect(canvas.getByRole('gridcell', { name: '20' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const WithSelectedDate: Story = {
  args: { mode: 'single', selected: JAN_15, onSelect: fn() },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('gridcell', { name: '15' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const RangeSelection: Story = {
  args: {
    mode: 'range',
    selected: { from: new Date(2026, 0, 12), to: new Date(2026, 0, 16) },
    onSelect: fn(),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('gridcell', { name: '12' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('gridcell', { name: '14' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('gridcell', { name: '16' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const NavigateMonths: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /next month/i }));
    await expect(await canvas.findByRole('grid', { name: 'February 2026' })).toBeVisible();
    await expect(args.onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 1, 1));
    await userEvent.click(canvas.getByRole('button', { name: /previous month/i }));
    await expect(await canvas.findByRole('grid', { name: 'January 2026' })).toBeVisible();
  },
};

export const DisabledDates: Story = {
  args: {
    mode: 'single',
    onSelect: fn(),
    disabled: { before: new Date(2026, 0, 10) },
  },
  play: async ({ args, canvas, userEvent }) => {
    const day = canvas.getByRole('button', { name: /January 5th, 2026/ });
    await expect(day).toBeDisabled();
    await userEvent.setup({ pointerEventsCheck: 0 }).click(day);
    await expect(selectSpy(args)).not.toHaveBeenCalled();
  },
};

export const DropdownCaption: Story = {
  args: {
    captionLayout: 'dropdown',
    startMonth: new Date(2025, 0),
    endMonth: new Date(2027, 11),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: /month/i }), 'Mar');
    await expect(await canvas.findByRole('grid', { name: 'March 2026' })).toBeVisible();
  },
};
