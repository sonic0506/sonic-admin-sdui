import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FormEvent } from 'react';
import { expect, fn, waitFor } from 'storybook/test';
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from './questionnaire';

const questions = (
  <>
    <QuestionnaireProgress />
    <QuestionnaireItem name="role" required>
      <QuestionnaireTitle>What is your role?</QuestionnaireTitle>
      <QuestionnaireDescription>Pick the one that fits best.</QuestionnaireDescription>
      <QuestionnaireChoices>
        <QuestionnaireChoice value="engineering">
          Engineering
          <QuestionnaireChoiceDescription>
            Builds and ships the product
          </QuestionnaireChoiceDescription>
        </QuestionnaireChoice>
        <QuestionnaireChoice value="design">Design</QuestionnaireChoice>
        <QuestionnaireChoice value="product">Product</QuestionnaireChoice>
        <QuestionnaireChoice value="marketing" disabled>
          Marketing
        </QuestionnaireChoice>
      </QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>
    <QuestionnaireItem name="tools" multiple>
      <QuestionnaireTitle>Which tools do you use?</QuestionnaireTitle>
      <QuestionnaireChoices>
        <QuestionnaireChoice value="figma">Figma</QuestionnaireChoice>
        <QuestionnaireChoice value="storybook">Storybook</QuestionnaireChoice>
        <QuestionnaireChoice value="linear">Linear</QuestionnaireChoice>
      </QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>
    <QuestionnaireItem name="feedback">
      <QuestionnaireTitle>Anything else?</QuestionnaireTitle>
      <QuestionnaireInput aria-label="Anything else?" placeholder="Optional feedback" />
      <QuestionnaireError />
    </QuestionnaireItem>
    <QuestionnaireActions>
      <QuestionnairePrevious />
      <QuestionnaireSkip />
      <QuestionnaireNext />
      <QuestionnaireSubmit />
    </QuestionnaireActions>
  </>
);

const meta = {
  component: Questionnaire,
  tags: ['ai-generated'],
  args: {
    children: questions,
    // 실제 form 전송으로 iframe 이 이동하지 않도록 기본 동작을 막고 spy 로 전달한다
    onSubmit: fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()),
  },
} satisfies Meta<typeof Questionnaire>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('progressbar', { name: 'Questionnaire progress' }),
    ).toHaveTextContent('Question 1 of 3');
    await expect(canvas.getByRole('group', { name: 'What is your role?' })).toBeVisible();
    await expect(
      canvas.queryByRole('group', { name: 'Which tools do you use?' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('radio', { name: /Marketing/ })).toBeDisabled();
    // 첫 질문에서는 이전, 필수 질문에서는 건너뛰기, 마지막이 아니면 제출 버튼이 숨겨진다
    await expect(canvas.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Next' })).toBeVisible();
  },
};

export const RequiredQuestionUnanswered: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Choose an answer to continue.',
    );
    await expect(canvas.getByRole('progressbar')).toHaveTextContent('Question 1 of 3');

    await userEvent.click(canvas.getByRole('radio', { name: /Design/ }));
    await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument());

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(
      await canvas.findByRole('group', { name: 'Which tools do you use?' }),
    ).toBeVisible();
    await expect(canvas.getByRole('progressbar')).toHaveTextContent('Question 2 of 3');
  },
};

export const NavigateBackKeepsAnswer: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: /Product/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(
      await canvas.findByRole('group', { name: 'Which tools do you use?' }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await expect(await canvas.findByRole('group', { name: 'What is your role?' })).toBeVisible();
    await expect(canvas.getByRole('radio', { name: /Product/ })).toBeChecked();
  },
};

export const SkipOptionalQuestion: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: /Engineering/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await canvas.findByRole('group', { name: 'Which tools do you use?' });

    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(await canvas.findByRole('group', { name: 'Anything else?' })).toBeVisible();
    await expect(canvas.getByRole('progressbar')).toHaveTextContent('Question 3 of 3');
    await expect(canvas.getByRole('button', { name: 'Submit' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  },
};

export const SubmitWithAnswers: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: /Engineering/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await canvas.findByRole('group', { name: 'Which tools do you use?' });

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Figma' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Storybook' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await canvas.findByRole('group', { name: 'Anything else?' });

    await userEvent.type(canvas.getByRole('textbox', { name: 'Anything else?' }), 'Great tool');
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));

    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const event = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0];
    const data = new FormData(event.target as HTMLFormElement);
    await expect(data.get('role')).toBe('engineering');
    await expect(data.getAll('tools')).toEqual(['figma', 'storybook']);
    await expect(data.get('feedback')).toBe('Great tool');
  },
};

export const KeyboardShortcuts: Story = {
  args: { shortcuts: 'numbers' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: /Engineering/ })).toHaveFocus();

    await userEvent.keyboard('2');
    await expect(canvas.getByRole('radio', { name: /Design/ })).toBeChecked();

    await userEvent.keyboard('{Enter}');
    await expect(
      await canvas.findByRole('group', { name: 'Which tools do you use?' }),
    ).toBeVisible();
  },
};
