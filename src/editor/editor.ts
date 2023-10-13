import { Point, EditorState, KeyEvent } from "../types";
import { redraw } from "./drawing";
import interactPhaseDefs from "./interaction";

export function onMouseDown(editorState: EditorState, mousePoint: Point) {
  const isPhaseValid =
    interactPhaseDefs[editorState.interaction.interactPhase].isEditorStateValid(
      editorState
    );
  if (!isPhaseValid) return console.warn("Invalid phase");

  editorState.interaction.clickDownPoint[0] = mousePoint[0];
  editorState.interaction.clickDownPoint[1] = mousePoint[1];

  interactPhaseDefs[editorState.interaction.interactPhase].onMouseDown(
    editorState,
    mousePoint
  );

  redraw(editorState);
}

export function onMouseMove(editorState: EditorState, mousePoint: Point) {
  interactPhaseDefs[editorState.interaction.interactPhase].onMouseMove(
    editorState,
    mousePoint
  );

  redraw(editorState);
}

export function onMouseUp(editorState: EditorState, mousePoint: Point) {
  interactPhaseDefs[editorState.interaction.interactPhase].onMouseUp(
    editorState,
    mousePoint
  );

  redraw(editorState);
}

export function onKeyDown(
  editorState: EditorState,
  mousePoint: Point,
  keyEvent: KeyEvent
) {
  interactPhaseDefs[editorState.interaction.interactPhase].onKeyDown(
    editorState,
    mousePoint,
    keyEvent
  );

  redraw(editorState);
}

export function onKeyUp(
  editorState: EditorState,
  mousePoint: Point,
  keyEvent: KeyEvent
) {
  interactPhaseDefs[editorState.interaction.interactPhase].onKeyUp(
    editorState,
    mousePoint,
    keyEvent
  );

  redraw(editorState);
}
