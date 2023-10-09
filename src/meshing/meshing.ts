import * as earcut from "earcut";
import { concat, flatten, isNotNil, map, splitEvery } from "ramda";
import {
  getThickenedPathClosedPath,
  getBufferPoints,
} from "../geometry/geometry";
import { Triangulation, Path, Point, TriangleIndices } from "../types";

export function getPathTriangulation(path: Path, width: number): Triangulation {
  const pathPoints = map((node) => node.point, path.nodes);
  const thickenedPathClosedPath = getThickenedPathClosedPath(pathPoints, width);
  const closedPathTriangulation = getPathPointsTriangulation(
    thickenedPathClosedPath
  );
  return closedPathTriangulation;
}

export function getPathPointsTriangulation(
  points: Array<Point>,
  holes?: Array<Array<Point>>
): Triangulation {
  const _holes = isNotNil(holes) ? holes : [];
  const pointsBuffer = concat(flatten(points), flatten(_holes));
  const holesStartIndices = [points.length];
  _holes.forEach((holePoints, index) => {
    const nextIndex = holesStartIndices[index] + holePoints.length;
    holesStartIndices.push(nextIndex);
  });
  holesStartIndices.splice(holesStartIndices.length - 1);
  const trianglesIndices = splitEvery(
    3,
    earcut(pointsBuffer, holesStartIndices)
  ) as Array<TriangleIndices>;
  const trianglesPoints = getBufferPoints(pointsBuffer);
  return {
    trianglesIndices,
    trianglesPoints,
  };
}
