import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Checkbox } from './checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field';
import { Input } from './input';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Switch } from './switch';

const meta = {
  component: Field,
  tags: ['ai-generated'],
  args: { className: 'max-w-sm' },
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" placeholder="jane" />
      <FieldDescription>Choose a unique username for your account.</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Username'));
    const input = canvas.getByRole('textbox', { name: 'Username' });
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'jane');
    await expect(input).toHaveValue('jane');
  },
};

export const WithError: Story = {
  args: { 'data-invalid': true } as Record<string, unknown>,
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" aria-invalid defaultValue="not-an-email" aria-describedby="email-error" />
      <FieldError id="email-error">Enter a valid email address.</FieldError>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Enter a valid email address.');
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription(
      'Enter a valid email address.',
    );
  },
};

export const WithMultipleErrors: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="password">Password</FieldLabel>
      <Input id="password" type="password" aria-invalid />
      <FieldError
        errors={[
          { message: 'Must be at least 8 characters.' },
          { message: 'Must contain a number.' },
          { message: 'Must be at least 8 characters.' },
        ]}
      />
    </Field>
  ),
  play: async ({ canvas }) => {
    const alert = canvas.getByRole('alert');
    // 중복 메시지는 한 번만 표시된다
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(alert).toHaveTextContent('Must contain a number.');
  },
};

export const WithoutErrors: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="name">Name</FieldLabel>
      <Input id="name" />
      <FieldError errors={[]} />
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <Field {...args}>
      <Checkbox id="newsletter" />
      <FieldContent>
        <FieldLabel htmlFor="newsletter">Subscribe to newsletter</FieldLabel>
        <FieldDescription>Get product updates once a month.</FieldDescription>
      </FieldContent>
    </Field>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Subscribe to newsletter'));
    await expect(canvas.getByRole('checkbox', { name: 'Subscribe to newsletter' })).toBeChecked();
  },
};

export const Disabled: Story = {
  args: { 'data-disabled': true } as Record<string, unknown>,
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="disabled-username">Username</FieldLabel>
      <Input id="disabled-username" disabled />
      <FieldDescription>This field is managed by your admin.</FieldDescription>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Username' })).toBeDisabled();
  },
};

export const FieldSetWithRadioGroup: Story = {
  render: () => (
    <FieldSet className="max-w-sm">
      <FieldLegend variant="label">Notification frequency</FieldLegend>
      <FieldDescription>How often should we email you?</FieldDescription>
      <RadioGroup defaultValue="daily" aria-label="Notification frequency">
        <Field orientation="horizontal">
          <RadioGroupItem value="daily" id="freq-daily" />
          <FieldLabel htmlFor="freq-daily">Daily</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="weekly" id="freq-weekly" />
          <FieldLabel htmlFor="freq-weekly">Weekly</FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('group', { name: 'Notification frequency' })).toBeInTheDocument();
    await userEvent.click(canvas.getByText('Weekly'));
    await expect(canvas.getByRole('radio', { name: 'Weekly' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Daily' })).not.toBeChecked();
  },
};

export const ChoiceCard: Story = {
  render: () => (
    <FieldGroup className="max-w-sm">
      <FieldLabel htmlFor="two-factor">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle id="two-factor-title">Two-factor authentication</FieldTitle>
            <FieldDescription id="two-factor-description">
              Require a code when signing in.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="two-factor"
            aria-labelledby="two-factor-title"
            aria-describedby="two-factor-description"
          />
        </Field>
      </FieldLabel>
    </FieldGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const control = canvas.getByRole('switch', { name: 'Two-factor authentication' });
    await userEvent.click(canvas.getByText('Two-factor authentication'));
    await expect(control).toBeChecked();
  },
};

export const FormLayout: Story = {
  render: () => (
    <FieldSet className="max-w-sm">
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This information is shown on your public profile.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
          <Input id="profile-name" />
        </Field>
        <FieldSeparator>Or</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="profile-handle">Handle</FieldLabel>
          <Input id="profile-handle" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Profile' })).toBeInTheDocument();
    await expect(canvas.getByText('Or')).toBeInTheDocument();
  },
};
