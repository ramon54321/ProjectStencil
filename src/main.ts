import * as PIXI from "pixi.js";
import { createMesh, triangulate } from "./geometry/geometry";
import "./style.css";
import { concat, flatten, forEach, splitEvery } from "ramda";
import { Point, TriangleIndices } from "./types";
import { bufferToPoints } from "./utils";

// -- Setup Canvas
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="container">
    <!-- <canvas id="canvas"></canvas> -->
  </div>
`;
const width = 1024;
const height = 1024;

const app = new PIXI.Application({
  background: "#1099bb",
  backgroundAlpha: 1,
  resolution: 2,
  width,
  height,
  antialias: true,
});
app.view.style!.width = width + "px";
app.view.style!.height = height + "px";
document.querySelector("#container")?.appendChild(app.view as any);

const points: Array<Point> = [
  [100, 100],
  [0, 500],
  [500, 500],
  [500, 0],
  [0, 0],
];
const holesPoints: Array<Array<Point>> = [
  [
    [250, 250],
    [300, 250],
    [300, 300],
    [250, 300],
  ],
  [
    [350, 250],
    [400, 250],
    [400, 300],
    [350, 300],
  ],
  [
    [300, 100],
    [350, 100],
    [350, 200],
    [250, 200],
    [250, 150],
    [300, 150],
  ],
];

const triangulation = triangulate(points, holesPoints);

const createIndicesGroup = (triangleIndices: TriangleIndices) => {
  const mesh = createMesh(triangulation.trianglesPoints, triangleIndices);
  // mesh.drawMode = 2;
  mesh.position.set(200, 200);
  mesh.tint = Math.random();
  app.stage.addChild(mesh);
};

forEach(createIndicesGroup, triangulation.trianglesIndices);
