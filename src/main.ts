import "./style.css";
import * as PIXI from "pixi.js";
import { EditorState, KeyEvent, LayoutSerializable, Point } from "./types";
import { isNotNil, pick } from "ramda";
import {
  layoutSerializableToTraversable,
  layoutTraversableToSerializable,
} from "./layout/serialization";
import {
  onKeyDown,
  onKeyUp,
  onMouseDown,
  onMouseMove,
  onMouseUp,
} from "./editor/editor";

// -- Setup Canvas
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="container">
    <button id="button-save">Save</button>
  </div>
`;
const width = 1024;
const height = 1024;

const app = new PIXI.Application({
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

// -- Debug Layout
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
    wb: { pins: ["nb", "nc", "nd", "ne"], tags: [["road", "small"]] },
  },
};
const layoutDebugLocalStorageSerial = localStorage.getItem("stencil.json");
const layoutTraversable = isNotNil(layoutDebugLocalStorageSerial)
  ? layoutSerializableToTraversable(JSON.parse(layoutDebugLocalStorageSerial))
  : layoutSerializableToTraversable(layoutDebug);

// -- Editor
function getEventPosition(e: any): Point {
  return [e.offsetX, e.offsetY];
}
const editorState: EditorState = {
  app,
  layoutTraversable,
  interaction: {
    clickDownPoint: [0, 0],
    didMouseMove: false,
    pressedNode: undefined,
    selectedNode: undefined,
    selectedPaths: undefined,
    selectedPath: undefined,
    selectedPathNode: undefined,
    interactPhase: "TryPressNode",
  },
};
app.view.addEventListener!("mousedown", (e: any) => {
  onMouseDown(editorState, getEventPosition(e));
});
app.view.addEventListener!("mousemove", (e: any) => {
  onMouseMove(editorState, getEventPosition(e));
});
app.view.addEventListener!("mouseup", (e: any) => {
  onMouseUp(editorState, getEventPosition(e));
});
document.addEventListener("keydown", (e: any) => {
  if (e.repeat) return;
  const keys = pick(["key", "metaKey", "shiftKey"], e) as KeyEvent;
  onKeyDown(editorState, getEventPosition(e), keys);
});
document.addEventListener("keyup", (e: any) => {
  const keys = pick(["key", "metaKey", "shiftKey"], e) as KeyEvent;
  onKeyUp(editorState, getEventPosition(e), keys);
});

// -- Debug Save
function save() {
  const layoutSerializable = layoutTraversableToSerializable(layoutTraversable);
  localStorage.setItem("stencil.json", JSON.stringify(layoutSerializable));
}

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
