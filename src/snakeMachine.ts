import { createMachine } from "xstate";

type Dir = "Up" | "Left" | "Down" | "Right";
type Point = { x: number; y: number };
type BodyPart = Point & { dir: Dir };
type Snake = BodyPart[];

export type SnakeMachineContext = {
  snake: Snake;
  gridSize: Point;
  dir: Dir;
  apple: Point;
  score: number;
  highScore: number;
};

export const snakeMachine = createMachine<SnakeMachineContext>({
  id: "SnakeMachine",
  initial: "New Game",
  states: {
    "New Game": {
      on: {
        ARROW_KEY: {
          actions: "save dir",
          target: "#SnakeMachine.Moving"
        }
      }
    },
    Moving: {
      entry: "move snake",
      after: {
        "80": {
          target: "#SnakeMachine.Moving"
        }
      },
      always: [
        {
          cond: "ate apple",
          actions: ["grow snake", "increase score", "show new apple"]
        },
        {
          cond: "hit wall",
          target: "#SnakeMachine.Game Over"
        },
        {
          cond: "hit tail",
          target: "#SnakeMachine.Game Over"
        }
      ],
      on: {
        ARROW_KEY: {
          actions: "save dir",
          target: "#SnakeMachine.Moving"
        }
      }
    },
    "Game Over": {
      on: {
        NEW_GAME: {
          actions: "reset",
          description: 'triggered by pressing the "r" key',
          target: "#SnakeMachine.New Game"
        }
      }
    }
  }
});
