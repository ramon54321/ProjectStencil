import * as earcut from "earcut";
import { Geometry, Shader, Mesh } from "pixi.js";
import { concat, flatten, splitEvery } from "ramda";
import { Point, TriangleIndices } from "../types";
import { bufferToPoints, roundPoints } from "../utils";

export function triangulate(
  points: Array<Point>,
  holes: Array<Array<Point>>
): { trianglesIndices: Array<TriangleIndices>; trianglesPoints: Array<Point> } {
  const pointsBuffer = concat(flatten(points), flatten(holes));
  const holesStartIndices = [points.length];
  holes.forEach((holePoints, index) => {
    const nextIndex = holesStartIndices[index] + holePoints.length;
    holesStartIndices.push(nextIndex);
  });
  holesStartIndices.splice(holesStartIndices.length - 1);
  const trianglesIndices = splitEvery(
    3,
    earcut(pointsBuffer, holesStartIndices)
  ) as Array<TriangleIndices>;
  const trianglesPoints = bufferToPoints(pointsBuffer);
  return {
    trianglesIndices,
    trianglesPoints,
  };
}

export function createMesh(
  points: Array<Point>,
  indices: Array<number>
): Mesh<Shader> {
  const roundedPoints = roundPoints(points);
  const geometry = new Geometry()
    .addAttribute("aVertexPosition", flatten(roundedPoints), 2)
    .addIndex(indices);
  const shader = Shader.from(
    `
    precision mediump float;
    attribute vec2 aVertexPosition;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    void main() {
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }`,

    ` precision mediump float;

    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`
  );
  const mesh = new Mesh(geometry, shader);
  return mesh;
}
