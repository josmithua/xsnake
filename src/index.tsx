import './styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { assign } from 'xstate';
import { useMachine } from '@xstate/react';
import { snakeMachine, SnakeMachineContext } from './snakeMachine';

type Dir = SnakeMachineContext['dir'];
type Point = SnakeMachineContext['gridSize'];
type BodyPart = SnakeMachineContext['snake'][0];
type Snake = SnakeMachineContext['snake'];

const oppositeDir: Record<Dir, Dir> = {
  Up: 'Down',
  Down: 'Up',
  Left: 'Right',
  Right: 'Left',
};

function isSamePos(p1: Point, p2: Point) {
  return p1.x === p2.x && p1.y === p2.y;
}

function isOutsideGrid(gridSize: Point, p: Point) {
  return p.x < 0 || p.x >= gridSize.x || p.y < 0 || p.y >= gridSize.y;
}

function find<T extends Point>(points: T[], p: Point) {
  return points.find((pp) => isSamePos(pp, p));
}

function head(snake: Snake) {
  return snake[0];
}

function body(snake: Snake) {
  return snake.slice(1);
}

function newHead(oldHead: BodyPart, dir: Dir): BodyPart {
  switch (dir) {
    case 'Up':
      return { x: oldHead.x, y: oldHead.y - 1, dir };
    case 'Down':
      return { x: oldHead.x, y: oldHead.y + 1, dir };
    case 'Left':
      return { x: oldHead.x - 1, y: oldHead.y, dir };
    case 'Right':
      return { x: oldHead.x + 1, y: oldHead.y, dir };
  }
}

function moveSnake(snake: Snake, dir: Dir): Snake {
  return [newHead(head(snake), dir), ...snake.slice(0, -1)];
}

function randomGridPoint(gridSize: Point): Point {
  return {
    x: Math.floor(Math.random() * gridSize.x),
    y: Math.floor(Math.random() * gridSize.y),
  };
}

function newApple(gridSize: Point, ineligibleGridPoints: Point[]) {
  let newApple = randomGridPoint(gridSize);
  while (find(ineligibleGridPoints, newApple)) {
    newApple = randomGridPoint(gridSize);
  }
  return newApple;
}

function growSnake(snake: Snake): Snake {
  return [...snake, snake[snake.length - 1]];
}

function makeInitialSnake(gridSize: Point): Snake {
  const head: BodyPart = {
    x: Math.floor(gridSize.x / 2),
    y: Math.floor(gridSize.y / 2),
    dir: 'Right',
  };
  return [head, { ...head, x: head.x - 1 }, { ...head, x: head.x - 2 }];
}

function makeInitialApple(gridSize: Point): Point {
  return {
    x: Math.floor((gridSize.x * 3) / 4),
    y: Math.floor(gridSize.y / 2),
  };
}

function createInitialContext(): SnakeMachineContext {
  const gridSize: Point = { x: 25, y: 15 };
  return {
    gridSize,
    snake: makeInitialSnake(gridSize),
    apple: makeInitialApple(gridSize),
    score: 0,
    highScore: 0,
    dir: 'Right',
  };
}

const configuredSnakeMachine = snakeMachine
  .withContext(createInitialContext)
  .withConfig({
    guards: {
      'ate apple': (c) => isSamePos(head(c.snake), c.apple),
      'hit tail': (c) => !!find(body(c.snake), head(c.snake)),
      'hit wall': (c) => isOutsideGrid(c.gridSize, head(c.snake)),
    },
    actions: {
      'move snake': assign({ snake: (c) => moveSnake(c.snake, c.dir) }),
      'save dir': assign({
        dir: (c, e) => (e.dir !== oppositeDir[c.dir] ? e.dir : c.dir),
      }),
      'increase score': assign({
        score: (c) => c.score + 1,
        highScore: (c) => Math.max(c.score + 1, c.highScore),
      }),
      'show new apple': assign({ apple: (c) => newApple(c.gridSize, c.snake) }),
      'grow snake': assign({ snake: (c) => growSnake(c.snake) }),
      reset: assign((c) => ({
        ...createInitialContext(),
        highScore: c.highScore,
      })),
    },
  });

function App() {
  const [current, send] = useMachine(configuredSnakeMachine);
  const { gridSize, score, highScore } = current.context;
  const isGameOver = current.matches('Game Over');

  React.useEffect(() => {
    function keyListener(event: KeyboardEvent) {
      const [maybeKey, maybeDir] = event.key.split('Arrow');
      if (maybeDir) {
        send({ type: 'ARROW_KEY', dir: maybeDir as Dir });
      } else if (maybeKey === 'r') {
        send({ type: 'NEW_GAME' });
      }
    }

    window.addEventListener('keydown', keyListener);
    return () => window.removeEventListener('keydown', keyListener);
  }, [send]);

  return (
    <div className="App">
      <header>
        <h1 style={{ marginBottom: 0 }}>XSnake</h1>
        <p style={{ margin: 0 }}>Snake with a sweet twist, built with XState</p>
      </header>
      <p style={{ fontSize: '1.2em', marginBottom: 0 }}>
        {isGameOver ? 'Game Over!' : '\u00A0'}
      </p>
      <p>
        Score: {score}
        <br />
        High score: {highScore}
      </p>
      <div className="grid">
        {Array.from({ length: gridSize.y }).map((_, row) => (
          <div className="row" key={row}>
            {Array.from({ length: gridSize.x }).map((_, col) => {
              const cell = { x: col, y: row };
              const { type, dir } =
                getGamObjectAtPos(current.context, cell) || {};
              return (
                <div className="cell" key={col}>
                  <span
                    role="img"
                    aria-label={type}
                    className={type}
                    data-dir={dir}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.7em' }}>
        Press arrow keys to move, "r" for new game.
      </p>
    </div>
  );
}

type GameObject =
  | { type: 'head'; dir: Dir }
  | { type: 'body'; dir: Dir }
  | { type: 'apple'; dir: undefined };
function getGamObjectAtPos(
  context: SnakeMachineContext,
  p: Point
): GameObject | undefined {
  let maybeBodyPart: BodyPart | undefined;
  if (isSamePos(head(context.snake), p)) {
    return { type: 'head', dir: context.dir };
  } else if (isSamePos(context.apple, p)) {
    return { type: 'apple', dir: undefined };
  } else if ((maybeBodyPart = find(body(context.snake), p))) {
    return { type: 'body', dir: maybeBodyPart.dir };
  } else {
    return undefined;
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
