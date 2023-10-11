import { forEach, isNotNil, map, values } from "ramda";
import { debugDrawPath, debugDrawPoint } from "../draw";
import { Path, Point, Node, EditorState } from "../types";
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

export function redraw(editorState: EditorState) {
  const interaction = editorState.interaction;

  editorState.app.stage.removeChildren();

  // -- Render Editor

  // -- Reset Nodes
  forEach(
    (node: Node) => (node.payload.highlight = undefined),
    values(editorState.layoutTraversable.nodeMap as any)
  );

  // -- Highlight Interesting Nodes
  if (isNotNil(interaction.pressedNode)) {
    forEach(
      (node: Node) => (node.payload.highlight = [0.4, 0.9, 0.5]),
      interaction.pressedNode.nodes
    );
  }
  if (isNotNil(interaction.selectedNode)) {
    interaction.selectedNode.payload.highlight = [0.9, 0.4, 0.5];
    const drawPath = (path: Path) => {
      debugDrawPath(
        editorState.app,
        map((node) => node.point, path.nodes)
      );
    };
    forEach(drawPath, interaction.selectedNode.paths);
  }
  if (isNotNil(interaction.selectedPath)) {
    const drawPath = (path: Path) => {
      debugDrawPath(
        editorState.app,
        map((node) => node.point, path.nodes),
        [0.4, 0.4, 0.95]
      );
    };
    drawPath(interaction.selectedPath);
  }
  if (isNotNil(interaction.selectedPathNode)) {
    interaction.selectedPathNode.payload.highlight = [0.3, 0.4, 0.9];
  }

  // -- Draw Nodes
  const drawNode = (node: Node) => {
    const color = node.payload.highlight
      ? node.payload.highlight
      : [0.3, 0.3, 0.3];
    debugDrawPoint(editorState.app, node.point, color as any);
  };
  forEach(drawNode, values(editorState.layoutTraversable.nodeMap) as any);

  //
  // -- Render Composition
  //
  // const composition = composeLayoutTraversable(layoutTraversable);
  // const drawCompositionLayer = (layer: CompositionLayer) => {
  //   const color = layer.style.color;
  //   const drawTriangulation = (triangulation: Triangulation) => {
  //     debugDrawTriangulation(app, triangulation, color, DRAW_MODES.TRIANGLES);
  //   };
  //   forEach(drawTriangulation, layer.triangulations);
  // };
  // forEach(drawCompositionLayer, composition);
}
