import { forEach, isEmpty, isNil, isNotNil, map, values } from "ramda";
import { debugDrawPath, debugDrawPoint } from "../draw";
import {
  getDistance,
  getPointLineDistance,
  getPointsPathLines,
} from "../geometry/geometry";
import {
  Line,
  Path,
  Point,
  Node,
  LayoutTraversable,
  EditorState,
} from "../types";
import { assert } from "../utils";

const CLICK_DETECTION_DISTANCE = 20;

export function getEventPosition(e: any): Point {
  return [e.offsetX, e.offsetY];
}

export function getNearestNode(
  layoutTraversable: LayoutTraversable,
  point: Point
): [Node | undefined, number] {
  let nearestNode: Node | undefined = undefined;
  let nearestDistance = Infinity;
  const evaluateNode = (node: Node) => {
    const distance = getDistance(point, node.point);
    if (isNil(nearestNode) || distance < nearestDistance) {
      nearestNode = node;
      nearestDistance = distance;
    }
  };
  forEach(evaluateNode, values(layoutTraversable.nodeMap as any));
  return [nearestNode, nearestDistance];
}

export function getNearbyPaths(point: Point, paths: Array<Path>): Array<Path> {
  const nearbyPaths: Array<Path> = [];
  const evaluatePath = (path: Path) => {
    const getNearestLineDistance = (lines: Array<Line>): number => {
      let nearestDistance = Infinity;
      const evaluateLine = (line: Line) => {
        const distance = getPointLineDistance(line, point);
        if (distance <= nearestDistance) {
          nearestDistance = distance;
        }
      };
      forEach(evaluateLine, lines);
      return nearestDistance;
    };
    const pathDistance = getNearestLineDistance(
      getPointsPathLines(map((node) => node.point, path.nodes))
    );
    if (pathDistance <= CLICK_DETECTION_DISTANCE) {
      nearbyPaths.push(path);
    }
  };
  forEach(evaluatePath, paths);
  return nearbyPaths;
}

export function validatePhase(editorState: EditorState) {
  const interaction = editorState.interaction;
  if (interaction.interactPhase === "TryPressNode") {
    assert(isNil(interaction.pressedNode));
    assert(isNil(interaction.selectedNode));
    assert(isNil(interaction.selectedPaths));
    assert(isNil(interaction.selectedPath));
  } else if (interaction.interactPhase === "TrySelectNode") {
    assert(isNotNil(interaction.pressedNode));
    assert(isNil(interaction.selectedNode));
    assert(isNil(interaction.selectedPaths));
    assert(isNil(interaction.selectedPath));
  } else if (interaction.interactPhase === "TrySelectPath") {
    assert(isNil(interaction.pressedNode));
    assert(isNotNil(interaction.selectedNode));
    assert(isNil(interaction.selectedPaths));
    assert(isNil(interaction.selectedPath));
  }
}

export function onMouseDown(editorState: EditorState, position: Point) {
  const interaction = editorState.interaction;
  validatePhase(editorState);

  interaction.clickDownPoint[0] = position[0];
  interaction.clickDownPoint[1] = position[1];
  const [nearestNode, nearestNodeDistance] = getNearestNode(
    editorState.layoutTraversable,
    position
  );

  if (interaction.interactPhase === "TryPressNode") {
    if (nearestNodeDistance <= CLICK_DETECTION_DISTANCE) {
      interaction.pressedNode = nearestNode;
    }
  } else if (interaction.interactPhase === "TrySelectNode") {
    const pressedNodeDistance = getDistance(
      position,
      interaction.pressedNode!.point
    );
    if (pressedNodeDistance <= CLICK_DETECTION_DISTANCE) {
      interaction.selectedNode = interaction.pressedNode;
    }
    interaction.pressedNode = undefined;
  } else if (interaction.interactPhase === "TrySelectPath") {
    const nearbyPaths = getNearbyPaths(
      position,
      interaction.selectedNode!.paths
    );
    if (!isEmpty(nearbyPaths)) {
      interaction.selectedPaths = nearbyPaths;
    }
    if (
      isNotNil(interaction.selectedPaths) &&
      !isEmpty(interaction.selectedPaths)
    ) {
      interaction.selectedPath = interaction.selectedPaths[0];
    }
    interaction.selectedNode = undefined;
  }

  redraw(editorState);
}

export function onMouseMove(editorState: EditorState, position: Point) {
  const interaction = editorState.interaction;
  const distanceFromClick = getDistance(interaction.clickDownPoint, position);

  if (interaction.interactPhase === "TryPressNode") {
    if (isNotNil(interaction.pressedNode)) {
      interaction.pressedNode.point[0] = position[0];
      interaction.pressedNode.point[1] = position[1];
    }
  } else if (interaction.interactPhase === "TrySelectPath") {
    if (isNotNil(interaction.selectedPaths)) {
      const index =
        Math.floor(distanceFromClick / 20) % interaction.selectedPaths.length;
      interaction.selectedPath = interaction.selectedPaths[index];
    }
  }

  redraw(editorState);
}

export function onMouseUp(editorState: EditorState, position: Point) {
  const interaction = editorState.interaction;

  if (interaction.interactPhase === "TryPressNode") {
    if (isNotNil(interaction.pressedNode)) {
      interaction.interactPhase = "TrySelectNode";
    }
  } else if (interaction.interactPhase === "TrySelectNode") {
    if (isNotNil(interaction.selectedNode)) {
      interaction.interactPhase = "TrySelectPath";
    } else {
      interaction.interactPhase = "TryPressNode";
    }
  } else if (interaction.interactPhase === "TrySelectPath") {
    if (isNotNil(interaction.selectedPath)) {
      console.log("In some phase where you deal with the selected path");
    } else {
      interaction.interactPhase = "TryPressNode";
    }
    interaction.selectedPaths = undefined;
  }

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
