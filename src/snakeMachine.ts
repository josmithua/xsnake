import { createMachine } from 'xstate';

type Dir = 'Up' | 'Left' | 'Down' | 'Right';
type Point = { x: number; y: number };
type BodyPart = Point & { dir: Dir };
type Snake = BodyPart[];

// Currently with xstate v4.30.3, ContextFrom<typeof machine> does not work
// (see https://github.com/statelyai/xstate/pull/3104), so we have to export
// the context type manually.
// TODO: remove this comment and type export when xstate@>=v4.30.4 is released
export type SnakeMachineContext = {
  snake: Snake;
  gridSize: Point;
  dir: Dir;
  apple: Point;
  score: number;
  highScore: number;
};

export const snakeMachine = createMachine({
  id: 'SnakeMachine',
  tsTypes: {} as import('./snakeMachine.typegen').Typegen0,
  schema: {
    context: {} as SnakeMachineContext,
    events: {} as { type: 'NEW_GAME' } | { type: 'ARROW_KEY'; dir: Dir },
  },
  initial: 'New Game',
  states: {
    'New Game': {
      on: {
        ARROW_KEY: {
          actions: 'save dir',
          target: '#SnakeMachine.Moving',
        },
      },
    },
    Moving: {
      entry: 'move snake',
      after: {
        '80': {
          target: '#SnakeMachine.Moving',
        },
      },
      always: [
        {
          cond: 'ate apple',
          actions: ['grow snake', 'increase score', 'show new apple'],
        },
        {
          cond: 'hit wall',
          target: '#SnakeMachine.Game Over',
        },
        {
          cond: 'hit tail',
          target: '#SnakeMachine.Game Over',
        },
      ],
      on: {
        ARROW_KEY: {
          actions: 'save dir',
          target: '#SnakeMachine.Moving',
        },
      },
    },
    'Game Over': {
      on: {
        NEW_GAME: {
          actions: 'reset',
          description: 'triggered by pressing the "r" key',
          target: '#SnakeMachine.New Game',
        },
      },
    },
  },
});
