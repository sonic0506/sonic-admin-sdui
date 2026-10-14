import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Input } from './input';
import { Label } from './label';

const meta = {
  component: Label,
  tags: ['ai-generated'],
  args: { children: 'Email' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Email')).toBeVisible();
  },
};

export const WithInput: Story = {
  args: { htmlFor: 'label-email' },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label {...args} />
      <Input id="label-email" />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Email'));
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  },
};

export const WithCheckbox: Story = {
  args: { children: 'Accept terms' },
  render: (args) => (
    <Label {...args}>
      <input type="checkbox" />
      {args.children}
    </Label>
  ),
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Accept terms' });
    await userEvent.click(canvas.getByText('Accept terms'));
    await expect(checkbox).toBeChecked();
  },
};

export const WithDisabledInput: Story = {
  args: { htmlFor: 'label-disabled' },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Input id="label-disabled" className="peer" disabled />
      <Label {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeDisabled();
  },
};
