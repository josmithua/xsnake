import { createMachine } from "xstate";
import { log } from "xstate/lib/actions";

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

export const snakeMachine = createMachine({
  id: "SnakeMachine",
  schema: {
    context: {} as SnakeMachineContext,
    events: {} as { type: "ARROW_KEY"; dir: Dir }
  },
  initial: "Stationary",
  states: {
    Stationary: {
      on: {
        ARROW_KEY: {
          target: "#SnakeMachine.Moving",
          actions: "save dir"
        }
      }
    },
    Moving: {
      entry: ["move snake", log("hi")],
      after: {
        "7500": {
          target: "#SnakeMachine.Moving"
        }
      },
      always: [
        {
          cond: "ate apple",
          actions: ["increment score", "grow snake", "show new apple"]
        },
        {
          cond: "hit tail",
          target: "#SnakeMachine.Game Over"
        },
        {
          cond: "hit wall",
          target: "#SnakeMachine.Game Over"
        }
      ],
      on: {
        ARROW_KEY: {
          actions: "save dir"
        }
      }
    },
    "Game Over": {
      on: {
        NEW_GAME: {
          target: "#SnakeMachine.Stationary",
          actions: "reset"
        }
      }
    }
  }
});
