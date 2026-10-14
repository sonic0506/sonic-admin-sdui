import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const tabs = ({
  variant,
  disabledValue,
}: { variant?: 'default' | 'line'; disabledValue?: string } = {}) => (
  <>
    <TabsList variant={variant} aria-label="Account sections">
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password" disabled={disabledValue === 'password'}>
        Password
      </TabsTrigger>
      <TabsTrigger value="billing">Billing</TabsTrigger>
    </TabsList>
    <TabsContent value="account">Update your name and email.</TabsContent>
    <TabsContent value="password">Change your password.</TabsContent>
    <TabsContent value="billing">Manage your payment methods.</TabsContent>
  </>
);

const meta = {
  component: Tabs,
  tags: ['ai-generated'],
  args: {
    defaultValue: 'account',
    className: 'w-96',
    onValueChange: fn(),
    children: tabs(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const account = canvas.getByRole('tab', { name: 'Account' });
    const billing = canvas.getByRole('tab', { name: 'Billing' });
    await expect(account).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel', { name: 'Account' })).toHaveTextContent(
      'Update your name and email.',
    );

    await userEvent.click(billing);
    await expect(billing).toHaveAttribute('aria-selected', 'true');
    await expect(account).toHaveAttribute('aria-selected', 'false');
    await expect(canvas.getByRole('tabpanel', { name: 'Billing' })).toHaveTextContent(
      'Manage your payment methods.',
    );
    await expect(canvas.queryByText('Update your name and email.')).not.toBeInTheDocument();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('billing');
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvas, userEvent }) => {
    const account = canvas.getByRole('tab', { name: 'Account' });
    const password = canvas.getByRole('tab', { name: 'Password' });
    const billing = canvas.getByRole('tab', { name: 'Billing' });

    await userEvent.tab();
    await expect(account).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(password).toHaveFocus();
    await expect(password).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel', { name: 'Password' })).toBeVisible();

    await userEvent.keyboard('{End}');
    await expect(billing).toHaveFocus();
    // 마지막 탭에서 ArrowRight 는 처음으로 순환한다
    await userEvent.keyboard('{ArrowRight}');
    await expect(account).toHaveFocus();
    await expect(account).toHaveAttribute('aria-selected', 'true');
  },
};

export const LineVariant: Story = {
  args: { children: tabs({ variant: 'line' }) },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('tab', { name: 'Password' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const DisabledTab: Story = {
  args: { children: tabs({ disabledValue: 'password' }) },
  play: async ({ canvas, userEvent }) => {
    const account = canvas.getByRole('tab', { name: 'Account' });
    const password = canvas.getByRole('tab', { name: 'Password' });
    await expect(password).toBeDisabled();

    // 키보드 탐색은 비활성 탭을 건너뛴다
    await userEvent.tab();
    await expect(account).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveFocus();
    await expect(password).toHaveAttribute('aria-selected', 'false');
  },
};
