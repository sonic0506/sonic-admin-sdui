import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderIcon, HomeIcon, InboxIcon, PlusIcon, SettingsIcon } from 'lucide-react';
import { expect, waitFor, within } from 'storybook/test';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from './sidebar';
import { TooltipProvider } from './tooltip';

// SidebarProvider 가 열림 상태를 이 쿠키에 기록한다 (sidebar.tsx 의 SIDEBAR_COOKIE_NAME)
const SIDEBAR_COOKIE = 'sidebar_state';

const meta = {
  component: Sidebar,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  beforeEach: () => {
    const previous = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${SIDEBAR_COOKIE}=`));
    return () => {
      document.cookie = previous ? `${previous}; path=/` : `${SIDEBAR_COOKIE}=; path=/; max-age=0`;
    };
  },
  // SidebarMenuButton 의 tooltip 은 앱 루트의 TooltipProvider 를 전제로 한다
  render: (args) => (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar {...args}>
          <SidebarHeader>
            <span className="px-2 text-sm font-semibold">Admin Console</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive tooltip="Dashboard">
                      <a href="#dashboard" aria-current="page">
                        <HomeIcon />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Inbox">
                      <a href="#inbox">
                        <InboxIcon />
                        <span>Inbox</span>
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupAction aria-label="Add project">
                <PlusIcon />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Design system">
                      <FolderIcon />
                      <span>Design system</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#tokens">
                          <span>Tokens</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#components">
                          <span>Components</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-sm font-medium">Dashboard</h1>
          </header>
          <div className="p-4 text-sm">Page content</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  ),
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// 열림/닫힘 상태는 data-state 로만 노출된다 (트리거에 aria-expanded 없음)
const getSidebar = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-slot="sidebar"]')!;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const sidebar = getSidebar(canvasElement);
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    await expect(canvas.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(canvas.getByRole('link', { name: 'Inbox' })).toHaveAttribute('href', '#inbox');
    await expect(canvas.getByRole('link', { name: 'Tokens' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Design system' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Add project' })).toBeVisible();
    await expect(canvas.getByText('12')).toBeVisible();

    const trigger = within(canvas.getByRole('main')).getByRole('button', {
      name: 'Toggle Sidebar',
    });
    await userEvent.click(trigger);
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await expect(sidebar).toHaveAttribute('data-collapsible', 'offcanvas');

    await userEvent.click(trigger);
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  },
};

export const ToggleWithKeyboardShortcut: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const sidebar = getSidebar(canvasElement);
    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    await userEvent.keyboard('{Meta>}b{/Meta}');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  },
};

export const ToggleWithRail: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const sidebar = getSidebar(canvasElement);
    const rail = within(sidebar).getByRole('button', { name: 'Toggle Sidebar' });
    await userEvent.click(rail);
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await expect(canvas.getByRole('main')).toBeVisible();
  },
};

export const CollapsibleToIcons: Story = {
  args: { collapsible: 'icon' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const sidebar = getSidebar(canvasElement);
    await userEvent.click(
      within(canvas.getByRole('main')).getByRole('button', { name: 'Toggle Sidebar' }),
    );
    await expect(sidebar).toHaveAttribute('data-collapsible', 'icon');

    // 아이콘만 남은 상태에서는 메뉴 이름을 툴팁으로 보여준다
    await userEvent.hover(canvas.getByRole('button', { name: 'Settings' }));
    const tooltip = await within(document.body).findByRole('tooltip');
    await expect(tooltip).toHaveTextContent('Settings');
  },
};

export const Floating: Story = {
  args: { variant: 'floating' },
};

export const Inset: Story = {
  args: { variant: 'inset' },
};

export const RightSide: Story = {
  args: { side: 'right' },
  play: async ({ canvasElement }) => {
    await expect(getSidebar(canvasElement)).toHaveAttribute('data-side', 'right');
  },
};

export const NotCollapsible: Story = {
  args: { collapsible: 'none' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvas, userEvent }) => {
    // 모바일에서는 Sheet(portal) 로 렌더링되고 처음에는 닫혀 있다
    await expect(canvas.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Toggle Sidebar' }));
    const body = within(document.body);
    const dialog = await body.findByRole('dialog', { name: 'Sidebar' });
    // Sheet 가 슬라이드·페이드 인 하는 동안은 투명하므로 보일 때까지 재시도한다
    await waitFor(() =>
      expect(within(dialog).getByRole('link', { name: 'Dashboard' })).toBeVisible(),
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};
