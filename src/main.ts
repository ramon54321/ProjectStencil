import "./style.css";
import * as PIXI from "pixi.js";
import { Line, Point, Vec2 } from "./types";
import {
  debugDrawLine,
  debugDrawPath,
  debugDrawPoint,
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
} from "./geometry/geometry";
import { aperture, forEach, isNotNil, map } from "ramda";

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

const pathPoints: Array<Point> = [
  [100, 100],
  [200, 200],
  [200, 300],
  [500, 400],
  [400, 300],
];

const pathLines: Array<Line> = aperture(2, pathPoints);

forEach((line: Line) => debugDrawLine(app, line), pathLines);

const pathPoints2 = getPathLinesPoints(pathLines);

forEach((point: Point) => debugDrawPoint(app, point), pathPoints2);

// debugDrawPath(app, pathPoints);

// const drawSegmentLines = (segmentLines: {
//   leftLine: Line;
//   rightLine: Line;
// }) => {
//   debugDrawLine(app, segmentLines.rightLine);
//   debugDrawLine(app, segmentLines.leftLine);
// };
// forEach(drawSegmentLines, segmentsOffsetLines);
//
// const line: Line = [
//   [500, 500],
//   [600, 600],
// ];
// debugDrawLine(app, line);
//
// const line2: Line = [
//   [600, 500],
//   [750, 600],
// ];
// debugDrawLine(app, line2);
//
// const intersect = getLinesIntersectPoint(line, line2);
// intersect && debugDrawPoint(app, intersect);

// const rotVec = getRotatedVec(lineVec, Math.PI / 8);
// debugDrawVec(app, line[0], rotVec);

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
