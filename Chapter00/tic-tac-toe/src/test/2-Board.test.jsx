// Level 2: one component, on its own. Board is "controlled": everything comes in as props, and
// a move goes out through onPlay. So the test gives it props and checks what it calls.
//
// [BEGINNER] render() draws the component into jsdom's fake page. `screen` finds things the way
// a person would: by their text or their role (getAllByRole('button') = every button).
// fireEvent.click() clicks like a user.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Board from '../Board.jsx';

const empty = Array(9).fill(null);

describe('<Board>', () => {
  it('shows the squares it gets and whose turn it is', () => {
    render(<Board xIsNext={false} squares={['X', null, null, null, null, null, null, null, null]} onPlay={() => {}} />);
    const squares = screen.getAllByRole('button');
    expect(squares).toHaveLength(9);
    expect(squares[0]).toHaveTextContent('X');
    expect(screen.getByText('Next player: O')).toBeInTheDocument();
  });

  // [BEGINNER] vi.fn() is a "mock" (a fake function) that remembers how it was called. Board
  // does not store the move itself; it hands a NEW board to onPlay.
  it('calls onPlay with a new board after a click', () => {
    const onPlay = vi.fn();
    render(<Board xIsNext={true} squares={empty} onPlay={onPlay} />);
    fireEvent.click(screen.getAllByRole('button')[4]);
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith([null, null, null, null, 'X', null, null, null, null]);
    // [ADVANCED] Immutability (lesson 06): the array Board received is unchanged.
    expect(empty).toEqual(Array(9).fill(null));
  });

  it('ignores a click on a filled square, and every click after a win', () => {
    const onPlay = vi.fn();
    const won = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    render(<Board xIsNext={false} squares={won} onPlay={onPlay} />);
    expect(screen.getByText('Winner: X')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getAllByRole('button')[8]);
    expect(onPlay).not.toHaveBeenCalled();
  });
});
