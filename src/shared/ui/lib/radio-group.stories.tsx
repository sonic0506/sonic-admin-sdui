import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';

const plans = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

const meta = {
  component: RadioGroup,
  tags: ['ai-generated'],
  args: { 'aria-label': 'Plan', onValueChange: fn() },
  render: (args) => (
    <RadioGroup {...args}>
      {plans.map((plan) => (
        <div key={plan.value} className="flex items-center gap-2">
          <RadioGroupItem value={plan.value} id={`plan-${plan.value}`} />
          <Label htmlFor={`plan-${plan.value}`}>{plan.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument();
    const pro = canvas.getByRole('radio', { name: 'Pro' });
    await userEvent.click(pro);
    await expect(pro).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Free' })).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledWith('pro');
  },
};

export const SelectByLabel: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Enterprise'));
    await expect(canvas.getByRole('radio', { name: 'Enterprise' })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledWith('enterprise');
  },
};

export const WithDefaultValue: Story = {
  args: { defaultValue: 'pro' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'Pro' })).toBeChecked();
  },
};

export const KeyboardNavigation: Story = {
  args: { defaultValue: 'free' },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'Free' })).toHaveFocus();
    // Radix 는 방향키가 눌린 상태에서 포커스가 옮겨질 때 선택하므로, 키를 누른 채로 검증한 뒤 뗀다
    await userEvent.keyboard('{ArrowDown>}');
    const pro = canvas.getByRole('radio', { name: 'Pro' });
    await waitFor(() => expect(pro).toHaveFocus());
    await waitFor(() => expect(pro).toBeChecked());
    await userEvent.keyboard('{/ArrowDown}');
    await expect(args.onValueChange).toHaveBeenCalledWith('pro');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const pro = canvas.getByRole('radio', { name: 'Pro' });
    await expect(pro).toBeDisabled();
    await userEvent.setup({ pointerEventsCheck: 0 }).click(pro);
    await expect(pro).not.toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const WithDisabledItem: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="free" id="item-free" />
        <Label htmlFor="item-free">Free</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="pro" id="item-pro" disabled />
        <Label htmlFor="item-pro">Pro (unavailable)</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const pro = canvas.getByRole('radio', { name: 'Pro (unavailable)' });
    await expect(pro).toBeDisabled();
    await userEvent.setup({ pointerEventsCheck: 0 }).click(pro);
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      {plans.map((plan) => (
        <div key={plan.value} className="flex items-center gap-2">
          <RadioGroupItem value={plan.value} id={`invalid-${plan.value}`} aria-invalid />
          <Label htmlFor={`invalid-${plan.value}`}>{plan.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'Free' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};
