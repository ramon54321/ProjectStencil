import * as earcut from "earcut";
import { concat, flatten, splitEvery } from "ramda";
import { Point, TriangleIndices } from "../types";
import { bufferToPoints } from "../utils";

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
