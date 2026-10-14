import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent as baseUserEvent, waitFor, within } from 'storybook/test';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

// 항목 선택 콜백은 Root 가 아닌 Item 의 prop 이라 스토리 전용 arg 로 받는다
type DropdownMenuStoryArgs = ComponentProps<typeof DropdownMenu> & {
  onItemSelect: (item: string) => void;
};

const meta = {
  component: DropdownMenu,
  tags: ['ai-generated'],
  args: { onOpenChange: fn(), onItemSelect: fn() },
  render: ({ onItemSelect, ...args }) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onItemSelect('profile')}>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onItemSelect('billing')} disabled>
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onItemSelect('settings')}>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onItemSelect('logout')}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<DropdownMenuStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Account' }));
    const menu = await body().findByRole('menu');
    // 열림 애니메이션(fade-in)이 끝나야 보이는 상태가 된다
    await waitFor(() => expect(menu).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(body().getByRole('menuitem', { name: /Profile/ }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('profile');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const CloseWithEscape: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Account' });
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
    canvas.getByRole('button', { name: 'Account' }).focus();
    await userEvent.keyboard('{Enter}');
    await body().findByRole('menu');
    await waitFor(() => expect(body().getByRole('menuitem', { name: /Profile/ })).toHaveFocus());

    // 비활성 항목(Billing)은 건너뛴다
    await userEvent.keyboard('{ArrowDown}');
    await expect(body().getByRole('menuitem', { name: 'Settings' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onItemSelect).toHaveBeenCalledWith('settings');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const DisabledItem: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Account' }));
    const billing = await body().findByRole('menuitem', { name: 'Billing' });
    await expect(billing).toHaveAttribute('aria-disabled', 'true');

    // 비활성 항목은 pointer-events:none 이라 기본 검사를 끄고 실제 클릭을 시도한다
    await baseUserEvent.setup({ pointerEventsCheck: 0 }).click(billing);
    await expect(args.onItemSelect).not.toHaveBeenCalled();
    await waitFor(() => expect(body().getByRole('menu')).toBeVisible());

    // 열린 modal 메뉴는 트리거를 aria-hidden 영역에 두므로, 접근성 검사 전에 닫는다
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const CheckboxItems: Story = {
  render: function Render({ onItemSelect, ...args }) {
    // CheckboxItem 은 checked 를 제어 prop 으로만 받으므로 상태를 스토리에서 들고 있는다
    const [statusBar, setStatusBar] = useState(true);
    const [activityBar, setActivityBar] = useState(false);
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">View</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
            Status bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={activityBar}
            onCheckedChange={setActivityBar}
            onSelect={() => onItemSelect('activity-bar')}
          >
            Activity bar
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'View' });
    await userEvent.click(trigger);
    await expect(
      await body().findByRole('menuitemcheckbox', { name: 'Status bar' }),
    ).toHaveAttribute('aria-checked', 'true');
    const activity = body().getByRole('menuitemcheckbox', { name: 'Activity bar' });
    await expect(activity).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(activity);
    await expect(args.onItemSelect).toHaveBeenCalledWith('activity-bar');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger);
    await expect(
      await body().findByRole('menuitemcheckbox', { name: 'Activity bar' }),
    ).toHaveAttribute('aria-checked', 'true');

    // 열린 modal 메뉴는 트리거를 aria-hidden 영역에 두므로, 접근성 검사 전에 닫는다
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const RadioItems: Story = {
  render: function Render({ onItemSelect, ...args }) {
    // RadioGroup 은 value 를 제어 prop 으로만 받으므로 상태를 스토리에서 들고 있는다
    const [position, setPosition] = useState('bottom');
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Panel position</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top" onSelect={() => onItemSelect('top')}>
              Top
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Panel position' });
    await userEvent.click(trigger);
    await expect(await body().findByRole('menuitemradio', { name: 'Bottom' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await userEvent.click(body().getByRole('menuitemradio', { name: 'Top' }));
    await expect(args.onItemSelect).toHaveBeenCalledWith('top');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger);
    await expect(await body().findByRole('menuitemradio', { name: 'Top' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(body().getByRole('menuitemradio', { name: 'Bottom' })).toHaveAttribute(
      'aria-checked',
      'false',
    );

    // 열린 modal 메뉴는 트리거를 aria-hidden 영역에 두므로, 접근성 검사 전에 닫는다
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const WithSubmenu: Story = {
  render: ({ onItemSelect, ...args }) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Share</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onSelect={() => onItemSelect('copy-link')}>Copy link</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => onItemSelect('email')}>Email</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onItemSelect('message')}>Message</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ args, canvas, userEvent }) => {
    canvas.getByRole('button', { name: 'Share' }).focus();
    await userEvent.keyboard('{Enter}');
    await body().findByRole('menu');
    await userEvent.keyboard('{ArrowDown}');
    const subTrigger = body().getByRole('menuitem', { name: 'Invite users' });
    await expect(subTrigger).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(subTrigger).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() => expect(body().getByRole('menuitem', { name: 'Email' })).toHaveFocus());

    await userEvent.keyboard('{Enter}');
    await expect(args.onItemSelect).toHaveBeenCalledWith('email');
    await waitFor(() => expect(body().queryByRole('menu')).not.toBeInTheDocument());
  },
};
