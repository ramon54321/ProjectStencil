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
} from "./geometry/geometry";
import {
  aperture,
  forEach,
  indexOf,
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

let pressedNode: Node | undefined = undefined;

app.view!.addEventListener!("mousedown", (e: any) => {
  const position = getEventPosition(e);
  const [nearestNode, nearestDistance] = getNearestNode(position);
  if (nearestDistance <= 20) {
    pressedNode = nearestNode;
  } else {
    pressedNode = undefined;
  }
  redraw();
});
app.view!.addEventListener!("mouseup", (e: any) => {
  pressedNode = undefined;
});
app.view!.addEventListener!("mousemove", (e: any) => {
  if (isNil(pressedNode)) return;
  const position = getEventPosition(e);
  pressedNode.point[0] = position[0];
  pressedNode.point[1] = position[1];
  redraw();
});

redraw();

function redraw() {
  app.stage.removeChildren();

  // -- Setup Payload for Debugging
  forEach(
    (node: Node) => (node.payload.highlight = false),
    values(layoutTraversable.nodeMap as any)
  );
  if (isNotNil(pressedNode)) {
    forEach((node: Node) => (node.payload.highlight = true), pressedNode.nodes);
  }

  const composition = composeLayoutTraversable(layoutTraversable);
  const drawCompositionLayer = (layer: CompositionLayer) => {
    const color = layer.style.color;
    const drawTriangulation = (triangulation: Triangulation) => {
      debugDrawTriangulation(app, triangulation, color, DRAW_MODES.TRIANGLES);
    };
    forEach(drawTriangulation, layer.triangulations);
  };
  forEach(drawCompositionLayer, composition);

  // const drawNode = (node: Node) => {
  //   const color = node.payload.highlight ? [0.4, 0.9, 0.5] : [0.3, 0.3, 0.3];
  //   debugDrawPoint(app, node.point, color as any);
  // };
  // forEach(drawNode, values(layoutTraversable.nodeMap) as any);
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
