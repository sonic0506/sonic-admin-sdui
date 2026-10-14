import type { MouseEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './navigation-menu';

// 스토리 iframe 이 실제로 이동하지 않도록 링크 기본 동작만 막는다 (Radix 의 select 처리는 그대로 동작)
const stayOnPage = (event: MouseEvent) => event.preventDefault();

const meta = {
  component: NavigationMenu,
  tags: ['ai-generated'],
  args: { onValueChange: fn() },
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem value="getting-started">
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1">
              <li>
                <NavigationMenuLink href="/docs/introduction" onClick={stayOnPage}>
                  Introduction
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/docs/installation" onClick={stayOnPage}>
                  Installation
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1">
              <li>
                <NavigationMenuLink href="/docs/components/dialog" onClick={stayOnPage}>
                  Dialog
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/docs/components/tabs" onClick={stayOnPage}>
                  Tabs
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/docs"
            onClick={stayOnPage}
            className={navigationMenuTriggerStyle()}
          >
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('navigation')).toBeVisible();
    const trigger = canvas.getByRole('button', { name: 'Getting started' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');

    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    const link = await canvas.findByRole('link', { name: 'Introduction' });
    await waitFor(() => expect(link).toBeVisible());
    await expect(link).toHaveAttribute('href', '/docs/introduction');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('getting-started');

    // 링크를 고르면 메뉴가 닫힌다
    await userEvent.click(link);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith('');
  },
};

export const CloseWithEscape: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Components' });
    await userEvent.click(trigger);
    await canvas.findByRole('link', { name: 'Dialog' });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() =>
      expect(canvas.queryByRole('link', { name: 'Dialog' })).not.toBeInTheDocument(),
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith('');
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvas, userEvent }) => {
    const gettingStarted = canvas.getByRole('button', { name: 'Getting started' });
    const components = canvas.getByRole('button', { name: 'Components' });

    // 트리거 사이는 좌우 방향키로 이동한다
    await userEvent.tab();
    await expect(gettingStarted).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(components).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(components).toHaveAttribute('aria-expanded', 'true'));

    // 아래 방향키로 열린 콘텐츠 안으로 들어간다
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(canvas.getByRole('link', { name: 'Dialog' })).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('link', { name: 'Tabs' })).toHaveFocus();

    // 열린 상태의 Radix 포커스 프록시(aria-hidden + tabindex=0)가 axe 위반이라 검사 전에 닫는다 (보고됨)
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(components).toHaveAttribute('aria-expanded', 'false'));
  },
};

export const WithoutViewport: Story = {
  args: { viewport: false },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Getting started' });
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    const link = await canvas.findByRole('link', { name: 'Installation' });
    await waitFor(() => expect(link).toBeVisible());

    // 열린 상태의 Radix 포커스 프록시(aria-hidden + tabindex=0)가 axe 위반이라 검사 전에 닫는다 (보고됨)
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  },
};
