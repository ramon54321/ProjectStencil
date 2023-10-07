import * as earcut from "earcut";
import { concat, flatten, splitEvery } from "ramda";
import { Line, Point, TriangleIndices, Vec2 } from "../types";
import { bufferToPoints } from "../utils";

export function getMagnitude(vec: Vec2): number {
  return Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
}

export function getScaledVec(vec: Vec2, factor: number): Vec2 {
  return [vec[0] * factor, vec[1] * factor];
}

export function getNormalizedVec(vec: Vec2): Vec2 {
  const mag = getMagnitude(vec);
  return getScaledVec(vec, 1 / mag);
}

export function getLineVec(line: Line): Vec2 {
  const dx = line[1][0] - line[0][0];
  const dy = line[1][1] - line[0][1];
  return [dx, dy];
}

export function getAddVec(vecA: Vec2, vecB: Vec2): Vec2 {
  return [vecA[0] + vecB[0], vecA[1] + vecB[1]];
}

export function getSubVec(vecA: Vec2, vecB: Vec2): Vec2 {
  return [vecA[0] - vecB[0], vecA[1] - vecB[1]];
}

export function getPerpendicularVec(vec: Vec2): Vec2 {
  return getNormalizedVec([-vec[0], vec[1]]);
}

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
