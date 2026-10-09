// Level 3: the whole game, the way a player uses it: click squares and move buttons, and read
// what the page shows. Nothing here knows about state, history or currentMove; if a later
// refactor keeps the game working, these tests keep passing.
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Game from '../Game.jsx';

// [BEGINNER] Helpers so the tests read like the game. The squares are the buttons with the CSS
// class "square"; the move buttons are found by their text.
const squares = () => Array.from(document.querySelectorAll('button.square'));
const play = (...indexes) => indexes.forEach((i) => fireEvent.click(squares()[i]));
const boardText = () => squares().map((s) => s.textContent || '.').join('');

describe('<Game>', () => {
  it('starts empty, with X to play', () => {
    render(<Game />);
    expect(boardText()).toBe('.........');
    expect(screen.getByText('Next player: X')).toBeInTheDocument();
    expect(screen.getByText('Go to game start')).toBeInTheDocument();
  });

  it('lets X and O take turns until somebody wins', () => {
    render(<Game />);
    play(0, 3, 1, 4, 2);
    expect(boardText()).toBe('XXXOO....');
    expect(screen.getByText('Winner: X')).toBeInTheDocument();
  });

  it('adds a move button for every move', () => {
    render(<Game />);
    play(0, 4);
    expect(screen.getByText('Go to move #1')).toBeInTheDocument();
    expect(screen.getByText('Go to move #2')).toBeInTheDocument();
  });

  it('travels back in time, and drops the future when you play from there', () => {
    render(<Game />);
    play(0, 4, 8);
    fireEvent.click(screen.getByText('Go to move #1'));
    expect(boardText()).toBe('X........');
    expect(screen.getByText('Next player: O')).toBeInTheDocument();

    play(5);
    expect(boardText()).toBe('X....O...');
    expect(screen.getByText('Go to move #2')).toBeInTheDocument();
    // [BEGINNER] queryByText returns null instead of failing when nothing is found.
    expect(screen.queryByText('Go to move #3')).toBe(null);
  });
});
