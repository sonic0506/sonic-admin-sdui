import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu';

// 항목 선택 콜백은 Root 가 아닌 Item 의 prop 이라 스토리 전용 arg 로 받는다
type ContextMenuStoryArgs = ComponentProps<typeof ContextMenu> & {
  onItemSelect: (item: string) => void;
};

const TRIGGER_TEXT = 'Right-click here';

function Area() {
  return (
    <ContextMenuTrigger className="flex h-36 w-72 items-center justify-center rounded-md border border-dashed text-sm">
      {TRIGGER_TEXT}
    </ContextMenuTrigger>
  );
}

const meta = {
  component: ContextMenu,
  tags: ['ai-generated'],
  args: { onOpenChange: fn(), onItemSelect: fn() },
  render: ({ onItemSelect, ...args }) => (
    <ContextMenu {...args}>
      <Area />
      <ContextMenuContent className="w-52">
        <ContextMenuItem onSelect={() => onItemSelect('back')}>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onItemSelect('forward')} disabled>
          Forward
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onItemSelect('reload')}>Reload</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => onItemSelect('delete')}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
} satisfies Meta<ContextMenuStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText(TRIGGER_TEXT) });
    const menu = await body().findByRole('menu');
    // 열림 애니메이션(fade-in)이 끝나야 보이는 상태가 된다
    await waitFor(() => expect(menu).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(body().getByRole('menuitem', { name: /Back/ }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('back');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const CloseWithEscape: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText(TRIGGER_TEXT) });
    await body().findByRole('menu');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
    await expect(args.onItemSelect).not.toHaveBeenCalled();
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText(TRIGGER_TEXT) });
    await body().findByRole('menu');

    await userEvent.keyboard('{ArrowDown}');
    await expect(body().getByRole('menuitem', { name: /Back/ })).toHaveFocus();
    // 비활성 항목(Forward)은 건너뛴다
    await userEvent.keyboard('{ArrowDown}');
    await expect(body().getByRole('menuitem', { name: 'Reload' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onItemSelect).toHaveBeenCalledWith('reload');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const CheckboxAndRadioItems: Story = {
  render: function Render({ onItemSelect, ...args }) {
    // CheckboxItem·RadioGroup 은 제어 prop 으로만 상태를 받으므로 스토리에서 상태를 들고 있는다
    const [showBookmarks, setShowBookmarks] = useState(true);
    const [showUrls, setShowUrls] = useState(false);
    const [person, setPerson] = useState('pedro');
    return (
      <ContextMenu {...args}>
        <Area />
        <ContextMenuContent className="w-52">
          <ContextMenuCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
            Show bookmarks
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={showUrls}
            onCheckedChange={setShowUrls}
            onSelect={() => onItemSelect('show-urls')}
          >
            Show full URLs
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>People</ContextMenuLabel>
          <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
            <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm" onSelect={() => onItemSelect('colm')}>
              Colm Tuite
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByText(TRIGGER_TEXT);
    await userEvent.pointer({ keys: '[MouseRight]', target: trigger });
    await expect(
      await body().findByRole('menuitemcheckbox', { name: 'Show bookmarks' }),
    ).toHaveAttribute('aria-checked', 'true');
    await expect(body().getByRole('menuitemradio', { name: 'Pedro Duarte' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await userEvent.click(body().getByRole('menuitemcheckbox', { name: 'Show full URLs' }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('show-urls');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger });
    await expect(
      await body().findByRole('menuitemcheckbox', { name: 'Show full URLs' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(body().getByRole('menuitemradio', { name: 'Colm Tuite' }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('colm');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger });
    await expect(await body().findByRole('menuitemradio', { name: 'Colm Tuite' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(body().getByRole('menuitemradio', { name: 'Pedro Duarte' })).toHaveAttribute(
      'aria-checked',
      'false',
    );

    // 열린 modal 메뉴는 나머지 화면을 aria-hidden 처리하므로, 접근성 검사 전에 닫는다
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const WithSubmenu: Story = {
  render: ({ onItemSelect, ...args }) => (
    <ContextMenu {...args}>
      <Area />
      <ContextMenuContent className="w-52">
        <ContextMenuItem onSelect={() => onItemSelect('save')}>Save page</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More tools</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem onSelect={() => onItemSelect('shortcut')}>
              Create shortcut
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => onItemSelect('devtools')}>
              Developer tools
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText(TRIGGER_TEXT) });
    await body().findByRole('menu');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const subTrigger = body().getByRole('menuitem', { name: 'More tools' });
    await expect(subTrigger).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(subTrigger).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() =>
      expect(body().getByRole('menuitem', { name: 'Create shortcut' })).toHaveFocus(),
    );

    await userEvent.keyboard('{Enter}');
    await expect(args.onItemSelect).toHaveBeenCalledWith('shortcut');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};
