import "./style.css";
import * as PIXI from "pixi.js";
import { Line, Point, Vec2 } from "./types";
import {
  debugDrawLine,
  debugDrawPath,
  debugDrawPoint,
  debugDrawVec,
} from "./draw";
import { getLineVec, getPerpendicularVec } from "./geometry/geometry";

// -- Setup Canvas
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="container">
    <!-- <canvas id="canvas"></canvas> -->
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

// Stencil takes a layout file as input (similar to .osm), crops to the desired tile, renders and outputs a raster tile
// -- LAYOUT_FILE -> PARSER -> TILER -> DRAW -> SAVE

//
// -- Drawing
//
// 1. Compute meshes for each element.
// 2. Split meshes based on layer
//

const path: Array<Point> = [
  [100, 100],
  [200, 200],
  [200, 300],
];
debugDrawPath(app, path);

const line: Line = [
  [400, 400],
  [600, 600],
];
debugDrawLine(app, line);
const lineVec = getLineVec(line);

const perpVec = getPerpendicularVec(lineVec);
debugDrawVec(app, line[0], perpVec);

// const perpendicularVec = getPerpendicularVec([])

// const points: Array<Point> = [
//   [50, 50],
//   [100, 100],
// ];
// debugDrawLine(app, points);
// debugDrawPoint(app, points[0]);
// debugDrawPoint(app, points[1]);

// const points: Array<Point> = [
//   [100, 100],
//   [0, 500],
//   [500, 500],
//   [500, 0],
//   [0, 0],
// ];
// const holesPoints: Array<Array<Point>> = [
//   [
//     [250, 250],
//     [300, 250],
//     [300, 300],
//     [250, 300],
//   ],
//   [
//     [350, 250],
//     [400, 250],
//     [400, 300],
//     [350, 300],
//   ],
//   [
//     [300, 100],
//     [350, 100],
//     [350, 200],
//     [250, 200],
//     [250, 150],
//     [300, 150],
//   ],
// ];
// const triangulation = triangulate(points, holesPoints);
//
// const createIndicesGroup = (triangleIndices: TriangleIndices) => {
//   const mesh = createMesh(triangulation.trianglesPoints, triangleIndices);
//   // mesh.drawMode = 2;
//   mesh.position.set(200, 200);
//   mesh.tint = Math.random();
//   app.stage.addChild(mesh);
// };
// forEach(createIndicesGroup, triangulation.trianglesIndices);
