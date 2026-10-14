import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Label } from './label';
import { Switch } from './switch';

const meta = {
  component: Switch,
  tags: ['ai-generated'],
  args: { 'aria-label': 'Airplane mode', onCheckedChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const control = canvas.getByRole('switch', { name: 'Airplane mode' });
    await expect(control).not.toBeChecked();
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(control);
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};

export const ToggledByKeyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    const control = canvas.getByRole('switch', { name: 'Airplane mode' });
    await expect(control).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(control).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};

export const Checked: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('switch', { name: 'Airplane mode' })).toBeChecked();
  },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const control = canvas.getByRole('switch', { name: 'Airplane mode' });
    await expect(control).toBeDisabled();
    await userEvent.setup({ pointerEventsCheck: 0 }).click(control);
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('switch', { name: 'Airplane mode' })).toBeInvalid();
  },
};

export const WithLabel: Story = {
  args: { 'aria-label': undefined, id: 'airplane-mode' },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch {...args} />
      <Label htmlFor="airplane-mode">Airplane mode</Label>
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Airplane mode'));
    await expect(canvas.getByRole('switch', { name: 'Airplane mode' })).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};
