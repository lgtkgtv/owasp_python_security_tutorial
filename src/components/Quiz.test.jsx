import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from './Quiz';

const questions = [
  { id: 1, question: 'Q1?', options: ['a', 'b'], correct: 1, explanation: 'because b' },
  { id: 2, question: 'Q2?', options: ['x', 'y'], correct: 0, explanation: 'because x' },
];

describe('Quiz', () => {
  it('disables submit until every question is answered', async () => {
    const user = userEvent.setup();
    render(<Quiz questions={questions} onComplete={vi.fn()} />);
    const submit = screen.getByRole('button', { name: /submit quiz/i });
    expect(submit).toBeDisabled();

    await user.click(screen.getByLabelText('b'));
    expect(submit).toBeDisabled();

    await user.click(screen.getByLabelText('x'));
    expect(submit).toBeEnabled();
  });

  it('calls onComplete only on a perfect score, and renders the results panel (incl. Trophy icon path)', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Quiz questions={questions} onComplete={onComplete} />);

    await user.click(screen.getByLabelText('a')); // wrong (correct is index 1)
    await user.click(screen.getByLabelText('x')); // correct
    await user.click(screen.getByRole('button', { name: /submit quiz/i }));

    expect(screen.getByText(/quiz complete/i)).toBeInTheDocument();
    expect(screen.getByText(/you scored 1 out of 2/i)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('calls onComplete when all answers are correct', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Quiz questions={questions} onComplete={onComplete} />);

    await user.click(screen.getByLabelText('b'));
    await user.click(screen.getByLabelText('x'));
    await user.click(screen.getByRole('button', { name: /submit quiz/i }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(screen.getByText(/perfect score/i)).toBeInTheDocument();
  });
});
