// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    "save dir": "ARROW_KEY";
    "grow snake": "";
    "increase score": "";
    "show new apple": "";
    reset: "NEW_GAME";
    "move snake": "ARROW_KEY" | "xstate.after(80)#SnakeMachine.Moving";
  };
  internalEvents: {
    "": { type: "" };
    "xstate.after(80)#SnakeMachine.Moving": {
      type: "xstate.after(80)#SnakeMachine.Moving";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions:
      | "save dir"
      | "grow snake"
      | "increase score"
      | "show new apple"
      | "reset"
      | "move snake";
    services: never;
    guards: "ate apple" | "hit wall" | "hit tail";
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    "ate apple": "";
    "hit wall": "";
    "hit tail": "";
  };
  eventsCausingDelays: {};
  matchesStates: "New Game" | "Moving" | "Game Over";
  tags: never;
}
