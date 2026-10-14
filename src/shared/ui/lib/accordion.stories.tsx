import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const ITEMS = [
  { value: 'shipping', title: 'Shipping', body: 'Orders ship within 2 business days.' },
  { value: 'returns', title: 'Returns', body: 'Return any item within 30 days.' },
  { value: 'support', title: 'Support', body: 'Contact us 24/7 via chat.' },
];

const items = (disabledValue?: string) =>
  ITEMS.map((item) => (
    <AccordionItem key={item.value} value={item.value} disabled={item.value === disabledValue}>
      <AccordionTrigger>{item.title}</AccordionTrigger>
      <AccordionContent>{item.body}</AccordionContent>
    </AccordionItem>
  ));

const meta = {
  component: Accordion,
  tags: ['ai-generated'],
  args: {
    type: 'single',
    className: 'w-96',
    onValueChange: fn(),
    children: items(),
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { collapsible: true },
  play: async ({ args, canvas, userEvent }) => {
    const shipping = canvas.getByRole('button', { name: 'Shipping' });
    const returns = canvas.getByRole('button', { name: 'Returns' });
    await expect(shipping).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(shipping);
    await expect(shipping).toHaveAttribute('aria-expanded', 'true');
    await expect(await canvas.findByRole('region', { name: 'Shipping' })).toHaveTextContent(
      'Orders ship within 2 business days.',
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith('shipping');

    // single 타입: 다른 항목을 열면 기존 항목은 닫힌다
    await userEvent.click(returns);
    await expect(returns).toHaveAttribute('aria-expanded', 'true');
    await expect(shipping).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(canvas.queryByRole('region', { name: 'Shipping' })).not.toBeInTheDocument(),
    );

    // collapsible: 열린 항목을 다시 누르면 닫힌다
    await userEvent.click(returns);
    await expect(returns).toHaveAttribute('aria-expanded', 'false');
  },
};

export const DefaultOpen: Story = {
  args: { defaultValue: 'returns' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Returns' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByRole('region', { name: 'Returns' })).toBeVisible();
  },
};

export const Multiple: Story = {
  args: { type: 'multiple' },
  play: async ({ canvas, userEvent }) => {
    const shipping = canvas.getByRole('button', { name: 'Shipping' });
    const support = canvas.getByRole('button', { name: 'Support' });
    await userEvent.click(shipping);
    await userEvent.click(support);
    await expect(shipping).toHaveAttribute('aria-expanded', 'true');
    await expect(support).toHaveAttribute('aria-expanded', 'true');
  },
};

export const KeyboardNavigation: Story = {
  args: { collapsible: true },
  play: async ({ canvas, userEvent }) => {
    const shipping = canvas.getByRole('button', { name: 'Shipping' });
    const returns = canvas.getByRole('button', { name: 'Returns' });
    const support = canvas.getByRole('button', { name: 'Support' });

    await userEvent.tab();
    await expect(shipping).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(returns).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(support).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(shipping).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(shipping).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    await expect(shipping).toHaveAttribute('aria-expanded', 'false');
  },
};

export const DisabledItem: Story = {
  args: { children: items('returns') },
  play: async ({ args, canvas, userEvent }) => {
    const returns = canvas.getByRole('button', { name: 'Returns' });
    await expect(returns).toBeDisabled();
    await expect(returns).toHaveAttribute('aria-expanded', 'false');
    // 키보드 탐색은 비활성 항목을 건너뛴다
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('button', { name: 'Support' })).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
