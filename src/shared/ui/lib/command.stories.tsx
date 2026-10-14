import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { Button } from './button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './command';

// 항목 선택 콜백은 Root 가 아닌 Item 의 prop 이라 스토리 전용 arg 로 받는다
type CommandStoryArgs = ComponentProps<typeof Command> & {
  onItemSelect: (item: string) => void;
};

function CommandItems({ onItemSelect }: Pick<CommandStoryArgs, 'onItemSelect'>) {
  return (
    <>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => onItemSelect('calendar')}>Calendar</CommandItem>
          <CommandItem onSelect={() => onItemSelect('search-emoji')}>Search emoji</CommandItem>
          <CommandItem onSelect={() => onItemSelect('calculator')} disabled>
            Calculator
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => onItemSelect('profile')}>
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => onItemSelect('billing')}>
            Billing
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

const meta = {
  component: Command,
  tags: ['ai-generated'],
  // label 은 cmdk 가 검색 입력의 접근 가능한 이름(sr-only label)으로 쓴다
  args: { label: 'Command menu', onItemSelect: fn() },
  render: ({ onItemSelect, ...args }) => (
    <Command {...args} className="w-80 rounded-lg border">
      <CommandItems onItemSelect={onItemSelect} />
    </Command>
  ),
} satisfies Meta<CommandStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('combobox', { name: 'Command menu' })).toBeVisible();
    await expect(canvas.getByRole('listbox')).toBeVisible();
    await expect(canvas.getAllByRole('option')).toHaveLength(5);
    await expect(canvas.getByRole('option', { name: 'Calculator' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await userEvent.click(canvas.getByRole('option', { name: 'Search emoji' }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('search-emoji');
  },
};

export const FilterByTyping: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Command menu' }), 'bill');

    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(1));
    await expect(canvas.getByRole('option', { name: /Billing/ })).toBeVisible();
    await expect(canvas.queryByRole('option', { name: 'Calendar' })).not.toBeInTheDocument();
    await expect(canvas.queryByText('No results found.')).not.toBeInTheDocument();
  },
};

export const NoResults: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Command menu' }), 'xyz');

    await expect(await canvas.findByText('No results found.')).toBeVisible();
    await expect(canvas.queryByRole('option')).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await expect(args.onItemSelect).not.toHaveBeenCalled();
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Command menu' }));
    // 첫 항목이 기본으로 선택되어 있다
    await expect(canvas.getByRole('option', { name: 'Calendar' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('option', { name: 'Search emoji' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    // 비활성 항목(Calculator)은 건너뛴다
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('option', { name: /Profile/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await userEvent.keyboard('{Enter}');
    await expect(args.onItemSelect).toHaveBeenCalledWith('profile');
  },
};

export const InDialog: Story = {
  render: function Render({ onItemSelect, ...args }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open command palette
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <Command {...args}>
            <CommandItems
              onItemSelect={(item) => {
                onItemSelect(item);
                setOpen(false);
              }}
            />
          </Command>
        </CommandDialog>
      </>
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    const body = within(document.body);
    const openButton = canvas.getByRole('button', { name: 'Open command palette' });

    await userEvent.click(openButton);
    const dialog = await body.findByRole('dialog', { name: 'Command Palette' });
    await waitFor(() => expect(dialog).toBeVisible());
    await waitFor(() => expect(body.getByRole('combobox', { name: 'Command menu' })).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());

    await userEvent.click(openButton);
    const input = await body.findByRole('combobox', { name: 'Command menu' });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard('cal');
    await expect(body.getByRole('option', { name: 'Calendar' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{Enter}');
    await expect(args.onItemSelect).toHaveBeenCalledWith('calendar');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};
