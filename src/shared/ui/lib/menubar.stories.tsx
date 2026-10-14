import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './menubar';

// 항목 선택 콜백은 Root 가 아닌 Item 의 prop 이라 스토리 전용 arg 로 받는다
type MenubarStoryArgs = ComponentProps<typeof Menubar> & {
  onItemSelect: (item: string) => void;
};

const meta = {
  component: Menubar,
  tags: ['ai-generated'],
  args: { onValueChange: fn(), onItemSelect: fn() },
  render: ({ onItemSelect, ...args }) => (
    <Menubar {...args}>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={() => onItemSelect('new-tab')}>
            New tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onSelect={() => onItemSelect('new-window')} disabled>
            New window
          </MenubarItem>
          <MenubarItem onSelect={() => onItemSelect('print')}>Print</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onSelect={() => onItemSelect('email-link')}>Email link</MenubarItem>
              <MenubarItem onSelect={() => onItemSelect('messages')}>Messages</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={() => onItemSelect('undo')}>Undo</MenubarItem>
          <MenubarItem onSelect={() => onItemSelect('redo')}>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
} satisfies Meta<MenubarStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('menubar')).toBeVisible();
    await userEvent.click(canvas.getByRole('menuitem', { name: 'File' }));
    const menu = await body().findByRole('menu');
    // 열림 애니메이션(fade-in)이 끝나야 보이는 상태가 된다
    await waitFor(() => expect(menu).toBeVisible());
    await expect(args.onValueChange).toHaveBeenLastCalledWith('file');

    await userEvent.click(body().getByRole('menuitem', { name: /New tab/ }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('new-tab');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
    await expect(args.onValueChange).toHaveBeenLastCalledWith('');
  },
};

export const CloseWithEscape: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('menuitem', { name: 'File' });
    await userEvent.click(trigger);
    await body().findByRole('menu');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onItemSelect).not.toHaveBeenCalled();
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const file = canvas.getByRole('menuitem', { name: 'File' });
    const edit = canvas.getByRole('menuitem', { name: 'Edit' });

    // 메뉴바 트리거 사이는 좌우 방향키로 이동한다
    await userEvent.tab();
    await expect(file).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(edit).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(file).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await body().findByRole('menu');
    await waitFor(() => expect(body().getByRole('menuitem', { name: /New tab/ })).toHaveFocus());
    // 비활성 항목(New window)은 건너뛴다
    await userEvent.keyboard('{ArrowDown}');
    await expect(body().getByRole('menuitem', { name: 'Print' })).toHaveFocus();

    // 열린 상태에서 오른쪽 방향키를 누르면 다음 메뉴(Edit)가 열린다
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(edit).toHaveAttribute('aria-expanded', 'true'));
    // 방향키로 옮겨 연 메뉴는 콘텐츠에 포커스가 가고, 아래 방향키로 첫 항목에 들어간다
    await waitFor(() => expect(body().getByRole('menu', { name: 'Edit' })).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await expect(body().getByRole('menuitem', { name: 'Undo' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onItemSelect).toHaveBeenCalledWith('undo');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const WithSubmenu: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('menuitem', { name: 'File' }));
    await body().findByRole('menu');
    const subTrigger = body().getByRole('menuitem', { name: 'Share' });
    await userEvent.click(subTrigger);
    await waitFor(() => expect(subTrigger).toHaveAttribute('aria-expanded', 'true'));

    await userEvent.click(await body().findByRole('menuitem', { name: 'Email link' }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('email-link');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const CheckboxAndRadioItems: Story = {
  render: function Render({ onItemSelect, ...args }) {
    // CheckboxItem·RadioGroup 은 제어 prop 으로만 상태를 받으므로 스토리에서 상태를 들고 있는다
    const [wordWrap, setWordWrap] = useState(true);
    const [minimap, setMinimap] = useState(false);
    const [theme, setTheme] = useState('system');
    return (
      <Menubar {...args}>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={wordWrap} onCheckedChange={setWordWrap}>
              Word wrap
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={minimap}
              onCheckedChange={setMinimap}
              onSelect={() => onItemSelect('minimap')}
            >
              Minimap
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarRadioGroup value={theme} onValueChange={setTheme}>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
              <MenubarRadioItem value="dark" onSelect={() => onItemSelect('dark')}>
                Dark
              </MenubarRadioItem>
              <MenubarRadioItem value="system">System</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('menuitem', { name: 'View' });
    await userEvent.click(trigger);
    await expect(
      await body().findByRole('menuitemcheckbox', { name: 'Word wrap' }),
    ).toHaveAttribute('aria-checked', 'true');
    await expect(body().getByRole('menuitemradio', { name: 'System' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await userEvent.click(body().getByRole('menuitemcheckbox', { name: 'Minimap' }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('minimap');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger);
    await expect(await body().findByRole('menuitemcheckbox', { name: 'Minimap' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await userEvent.click(body().getByRole('menuitemradio', { name: 'Dark' }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('dark');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger);
    await expect(await body().findByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(body().getByRole('menuitemradio', { name: 'System' })).toHaveAttribute(
      'aria-checked',
      'false',
    );

    // 열린 modal 메뉴는 나머지 화면을 aria-hidden 처리하므로, 접근성 검사 전에 닫는다
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};
