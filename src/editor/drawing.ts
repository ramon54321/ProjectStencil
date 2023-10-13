import { forEach, isNotNil, map, values } from "ramda";
import { debugDrawPath, debugDrawPoint } from "../draw";
import { EditorState, Path, Node, InteractPhase } from "../types";

/**
 * TODO: Move node style away from layout node payload and into separate map by node id.
 * Motivation: Will split the concerns and remove styling from the layout layer.
 */

/**
 * TODO: Add dashed lined.
 * Implementation: Add dash function to any line which splits line into array of lines, perhaps vector walk vertices.
 */

const drawMap: Record<InteractPhase, (editorState: EditorState) => void> = {
  TryPressNode: (editorState: EditorState) => {
    // -- Highlight adjacent nodes
    if (isNotNil(editorState.interaction.pressedNode)) {
      forEach(
        (node: Node) => (node.payload.highlight = [0.4, 0.9, 0.5]),
        editorState.interaction.pressedNode.nodes
      );
    }

    // -- Draw path
    const drawPath = (path: Path) => {
      debugDrawPath(
        editorState.app,
        map((node) => node.point, path.nodes),
        [0.2, 0.2, 0.2]
      );
    };
    forEach(drawPath, values(editorState.layoutTraversable.pathMap));

    // -- Draw nodes
    const drawNode = (node: Node) => {
      const color = node.payload.highlight
        ? node.payload.highlight
        : [0.3, 0.3, 0.3];
      debugDrawPoint(editorState.app, node.point, color);
    };
    forEach(drawNode, values(editorState.layoutTraversable.nodeMap));
  },

  TrySelectPath: (editorState: EditorState) => {
    editorState.interaction.selectedNode!.payload.highlight = [0.9, 0.4, 0.5];

    // -- Draw selected node paths
    const drawPath = (path: Path) => {
      if (editorState.interaction.selectedPath === path) return;
      debugDrawPath(
        editorState.app,
        map((node) => node.point, path.nodes),
        [0.3, 0.3, 0.3]
      );
    };
    forEach(drawPath, editorState.interaction.selectedNode!.paths);
    if (isNotNil(editorState.interaction.selectedPath)) {
      debugDrawPath(
        editorState.app,
        map((node) => node.point, editorState.interaction.selectedPath.nodes),
        [0.4, 0.9, 0.5]
      );
    }

    // -- Draw nodes
    const drawNode = (node: Node) => {
      const color = node.payload.highlight
        ? node.payload.highlight
        : [0.3, 0.3, 0.3];
      debugDrawPoint(editorState.app, node.point, color);
    };
    forEach(drawNode, values(editorState.layoutTraversable.nodeMap));
  },

  TrySelectPathNode: (editorState: EditorState) => {
    // -- Draw selected path
    debugDrawPath(
      editorState.app,
      map((node) => node.point, editorState.interaction.selectedPath!.nodes),
      [0.4, 0.9, 0.5]
    );

    // -- Draw nodes
    const drawNode = (node: Node) => {
      const color = node.payload.highlight
        ? node.payload.highlight
        : [0.3, 0.3, 0.3];
      debugDrawPoint(editorState.app, node.point, color);
    };
    forEach(drawNode, editorState.interaction.selectedPath!.nodes);
  },
};

// -- Render Editor
export function redraw(editorState: EditorState) {
  reset(editorState);

  drawMap[editorState.interaction.interactPhase](editorState);
}

function reset(editorState: EditorState) {
  // -- Clear Stage
  editorState.app.stage.removeChildren();

  // -- Nodes
  const resetNode = (node: Node) => (node.payload.highlight = undefined);
  forEach(resetNode, values(editorState.layoutTraversable.nodeMap));
}
