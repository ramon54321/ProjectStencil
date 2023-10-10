import "./style.css";
import * as PIXI from "pixi.js";
import {
  Line,
  Path,
  Point,
  RGB,
  Triangulation,
  Vec2,
  Node,
  LayoutSerializable,
  CompositionLayer,
} from "./types";
import {
  debugDrawClosedPath,
  debugDrawLine,
  debugDrawPath,
  debugDrawPoint,
  debugDrawTriangulation,
  debugDrawVec,
} from "./draw";
import {
  getInvertedVec,
  getLinesIntersectPoint,
  getLineVec,
  getParallelLine,
  getPerpendicularVec,
  getRotatedVec,
  getPathLinesPoints,
  getThickenedPathClosedPath,
  getDistance,
  getPointsPathLines,
  getPointLineDistance,
} from "./geometry/geometry";
import {
  aperture,
  forEach,
  indexOf,
  isEmpty,
  isNil,
  isNotNil,
  map,
  mapObjIndexed,
  minBy,
  reduce,
  values,
} from "ramda";
import { DRAW_MODES } from "pixi.js";
import { getPathTriangulation } from "./meshing/meshing";
import {
  layoutSerializableToTraversable,
  layoutTraversableToSerializable,
} from "./serialization/serialization";
import { composeLayoutTraversable } from "./composition/composition";

// -- Setup Canvas
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="container">
    <!-- <canvas id="canvas"></canvas> -->
    <button id="button-save">Save</button>
  </div>
`;
const width = 1024;
const height = 1024;

const app = new PIXI.Application({
  // background: "#1099bb",
  background: "#222222",
  backgroundAlpha: 1,
  resolution: 2,
  width,
  height,
  antialias: true,
});
app.view.style!.width = width + "px";
app.view.style!.height = height + "px";
document.querySelector("#container")?.appendChild(app.view as any);

document
  .querySelector<HTMLButtonElement>("#button-save")!
  .addEventListener("click", (e) => {
    save();
  });

// Stencil takes a layout file as input (similar to .osm), crops to the desired tile, renders and outputs a raster tile
// -- LAYOUT_FILE -> PARSER -> TILER -> DRAW -> SAVE

const layoutDebug: LayoutSerializable = {
  pinMap: {
    na: { point: [100, 100] },
    nb: { point: [200, 150] },
    nc: { point: [150, 200] },
    nd: { point: [350, 250] },
    ne: { point: [400, 125] },
  },
  wayMap: {
    wa: { pins: ["na", "nc", "nb"], tags: [["road", "medium"]] },
    wb: { pins: ["nc", "nd", "ne"], tags: [["road", "small"]] },
  },
};
const layoutDebugLocalStorageSerial = localStorage.getItem("stencil.json");
const layoutTraversable = isNotNil(layoutDebugLocalStorageSerial)
  ? layoutSerializableToTraversable(JSON.parse(layoutDebugLocalStorageSerial))
  : layoutSerializableToTraversable(layoutDebug);

// -- Input
const CLICK_DETECTION_DISTANCE = 20;
const getEventPosition = (e: any): Point => [e.offsetX, e.offsetY];
const getNearestNode = (point: Point): [Node | undefined, number] => {
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
};
const getNearbyPaths = (point: Point, paths: Array<Path>): Array<Path> => {
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
};

const assert = (expression: boolean, message?: string) => {
  if (!expression) throw Error(message);
};

type InteractPhase = "TryPressNode" | "TrySelectNode" | "TrySelectPath";

let clickDownPoint: Point = [0, 0];

let pressedNode: Node | undefined = undefined;
let selectedNode: Node | undefined = undefined;
let selectedPaths: Array<Path> | undefined = undefined;
let selectedPath: Path | undefined = undefined;

let interactPhase: InteractPhase = "TryPressNode";

const validatePhase = () => {
  if (interactPhase === "TryPressNode") {
    assert(isNil(pressedNode));
    assert(isNil(selectedNode));
    assert(isNil(selectedPaths));
    assert(isNil(selectedPath));
  } else if (interactPhase === "TrySelectNode") {
    assert(isNotNil(pressedNode));
    assert(isNil(selectedNode));
    assert(isNil(selectedPaths));
    assert(isNil(selectedPath));
  } else if (interactPhase === "TrySelectPath") {
    assert(isNil(pressedNode));
    assert(isNotNil(selectedNode));
    assert(isNil(selectedPaths));
    assert(isNil(selectedPath));
  }
};

app.view!.addEventListener!("mousedown", (e: any) => {
  validatePhase();

  const position = getEventPosition(e);
  clickDownPoint[0] = position[0];
  clickDownPoint[1] = position[1];
  const [nearestNode, nearestNodeDistance] = getNearestNode(position);

  if (interactPhase === "TryPressNode") {
    if (nearestNodeDistance <= CLICK_DETECTION_DISTANCE) {
      pressedNode = nearestNode;
    }
  } else if (interactPhase === "TrySelectNode") {
    const pressedNodeDistance = getDistance(position, pressedNode!.point);
    if (pressedNodeDistance <= CLICK_DETECTION_DISTANCE) {
      selectedNode = pressedNode;
    }
    pressedNode = undefined;
  } else if (interactPhase === "TrySelectPath") {
    const nearbyPaths = getNearbyPaths(position, selectedNode!.paths);
    if (!isEmpty(nearbyPaths)) {
      selectedPaths = nearbyPaths;
    }
    if (isNotNil(selectedPaths) && !isEmpty(selectedPaths)) {
      selectedPath = selectedPaths[0];
    }
    selectedNode = undefined;
  }

  redraw();
});
app.view!.addEventListener!("mousemove", (e: any) => {
  const position = getEventPosition(e);
  const distanceFromClick = getDistance(clickDownPoint, position);

  if (interactPhase === "TryPressNode") {
    if (isNotNil(pressedNode)) {
      pressedNode.point[0] = position[0];
      pressedNode.point[1] = position[1];
    }
  } else if (interactPhase === "TrySelectPath") {
    if (isNotNil(selectedPaths)) {
      const index = Math.floor(distanceFromClick / 20) % selectedPaths.length;
      selectedPath = selectedPaths[index];
    }
    selectedPaths = undefined;
  }

  redraw();
});
app.view!.addEventListener!("mouseup", (e: any) => {
  if (interactPhase === "TryPressNode") {
    if (isNotNil(pressedNode)) {
      interactPhase = "TrySelectNode";
    }
  } else if (interactPhase === "TrySelectNode") {
    if (isNotNil(selectedNode)) {
      interactPhase = "TrySelectPath";
    } else {
      interactPhase = "TryPressNode";
    }
  } else if (interactPhase === "TrySelectPath") {
    if (isNotNil(selectedPath)) {
      console.log("In some phase where you deal with the selected path");
    } else {
      interactPhase = "TryPressNode";
    }
  }

  redraw();
});

redraw();

function redraw() {
  app.stage.removeChildren();

  // -- Render Editor

  // -- Reset Nodes
  forEach(
    (node: Node) => (node.payload.highlight = undefined),
    values(layoutTraversable.nodeMap as any)
  );

  // -- Highlight Interesting Nodes
  if (isNotNil(pressedNode)) {
    forEach(
      (node: Node) => (node.payload.highlight = [0.4, 0.9, 0.5]),
      pressedNode.nodes
    );
  }
  if (isNotNil(selectedNode)) {
    selectedNode.payload.highlight = [0.9, 0.4, 0.5];
    const drawPath = (path: Path) => {
      debugDrawPath(
        app,
        map((node) => node.point, path.nodes)
      );
    };
    forEach(drawPath, selectedNode.paths);
  }
  if (isNotNil(selectedPath)) {
    const drawPath = (path: Path) => {
      debugDrawPath(
        app,
        map((node) => node.point, path.nodes),
        [0.4, 0.4, 0.95]
      );
    };
    drawPath(selectedPath);
  }

  // -- Draw Nodes
  const drawNode = (node: Node) => {
    const color = node.payload.highlight
      ? node.payload.highlight
      : [0.3, 0.3, 0.3];
    debugDrawPoint(app, node.point, color as any);
  };
  forEach(drawNode, values(layoutTraversable.nodeMap) as any);

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

function save() {
  const layoutSerializable = layoutTraversableToSerializable(layoutTraversable);
  localStorage.setItem("stencil.json", JSON.stringify(layoutSerializable));
}

// function load() {
//   const newLayoutTraversable = layoutSerializableToTraversable(
//     JSON.parse(localStorage.getItem("stencil.json")!)
//   );
//   layoutTraversable = newLayoutTraversable
// }
