import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, waitFor } from 'storybook/test';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './combobox';

const FRAMEWORKS = ['Next.js', 'Remix', 'Astro', 'Nuxt', 'SvelteKit'];

const meta = {
  component: Combobox,
  tags: ['ai-generated'],
  args: { items: FRAMEWORKS, onValueChange: fn(), onOpenChange: fn() },
  render: ({ disabled, ...args }) => (
    <Combobox {...args} disabled={disabled}>
      <ComboboxInput aria-label="Framework" placeholder="Select a framework" disabled={disabled} />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList aria-label="Frameworks">
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Framework' })).toHaveValue('');
    await expect(canvas.getByPlaceholderText('Select a framework')).toBeVisible();
  },
};

export const SelectOption: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Framework' });
    await userEvent.click(input);
    // ComboboxContent 는 portal 로 document.body 에 렌더링된다
    const listbox = await screen.findByRole('listbox');
    await waitFor(() => expect(listbox).toBeVisible());
    await userEvent.click(screen.getByRole('option', { name: 'Astro' }));
    await expect(args.onValueChange).toHaveBeenCalledWith('Astro', expect.anything());
    await expect(input).toHaveValue('Astro');
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
  },
};

export const FilterByTyping: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Framework' });
    await userEvent.type(input, 'nu');
    await expect(await screen.findByRole('option', { name: 'Nuxt' })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('option', { name: 'Remix' })).not.toBeInTheDocument(),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith('Nuxt', expect.anything());
    await expect(input).toHaveValue('Nuxt');
  },
};

export const NoResults: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Framework' }), 'angular');
    await expect(await screen.findByText('No frameworks found.')).toBeVisible();
    await expect(screen.queryByRole('option')).not.toBeInTheDocument();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const CloseWithEscape: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Framework' });
    await userEvent.click(input);
    await screen.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    await expect(input).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const WithDefaultValue: Story = {
  args: { defaultValue: 'Remix' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Framework' })).toHaveValue('Remix');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Framework' });
    await expect(input).toBeDisabled();
    // disabled 스타일이 pointer-events:none 이라 user-event 기본 검사를 끄고 실제 입력을 시도한다
    await userEvent.setup({ pointerEventsCheck: 0 }).type(input, 'as');
    await expect(input).toHaveValue('');
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};
