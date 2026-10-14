import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, waitFor } from 'storybook/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  component: Select,
  tags: ['ai-generated'],
  args: { onValueChange: fn(), onOpenChange: fn() },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Status">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="archived" disabled>
          Archived
        </SelectItem>
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'Select status',
    );
  },
};

export const SelectOption: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Status' });
    await userEvent.click(trigger);
    // SelectContent 는 portal 로 document.body 에 렌더링된다
    const listbox = await screen.findByRole('listbox');
    await expect(listbox).toBeVisible();
    await userEvent.click(screen.getByRole('option', { name: 'Pending' }));
    await expect(args.onValueChange).toHaveBeenCalledWith('pending');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('Pending');
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Status' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Active' })).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Pending' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith('pending');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const CloseWithEscape: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Status' });
    await userEvent.click(trigger);
    await screen.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledOption: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Status' }));
    const option = await screen.findByRole('option', { name: 'Archived' });
    await expect(option).toHaveAttribute('aria-disabled', 'true');
    // data-disabled 스타일이 pointer-events:none 이라 user-event 기본 검사를 끄고 실제 클릭을 시도한다
    await userEvent.setup({ pointerEventsCheck: 0 }).click(option);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  },
};

export const WithDefaultValue: Story = {
  args: { defaultValue: 'active' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Active');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Status' });
    await expect(trigger).toBeDisabled();
    await userEvent.setup({ pointerEventsCheck: 0 }).click(trigger);
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const SmallSizeWithGroups: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger size="sm" aria-label="Fruit">
        <SelectValue placeholder="Select fruit" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Fruit' });
    await userEvent.click(trigger);
    const group = await screen.findByRole('group', { name: 'Vegetables' });
    // popper 위치는 fade-in 애니메이션이 있어 보일 때까지 재시도한다
    await waitFor(() => expect(group).toBeVisible());
    await userEvent.click(screen.getByRole('option', { name: 'Carrot' }));
    await expect(args.onValueChange).toHaveBeenCalledWith('carrot');
    await expect(trigger).toHaveTextContent('Carrot');
    // popper 위치는 fade-out 애니메이션 뒤에 listbox 가 제거된다
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  },
};
