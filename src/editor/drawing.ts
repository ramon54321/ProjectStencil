import { forEach, isNotNil, map, values } from "ramda";
import { debugDrawPath, debugDrawPoint } from "../draw";
import { EditorState, Path, Node } from "../types";

/**
 * TODO: Move node style away from layout node payload and into separate map by node id.
 * Motivation: Will split the concerns and remove styling from the layout layer.
 */

export function redraw(editorState: EditorState) {
  const interaction = editorState.interaction;

  reset(editorState);

  // -- Render Editor /////////////////////////////// Render based on interactPhase -- render dashed line by adding dash function to any line which splits line into array of lines, perhaps vector walk vertexes

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
}

function reset(editorState: EditorState) {
  // -- Clear Stage
  editorState.app.stage.removeChildren();

  // -- Nodes
  const resetNode = (node: Node) => (node.payload.highlight = undefined);
  forEach(resetNode, values(editorState.layoutTraversable.nodeMap));
}
