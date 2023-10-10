import {
  all,
  aperture,
  concat,
  forEach,
  isEmpty,
  isNotNil,
  last,
  map,
  prop,
  reverse,
  splitEvery,
} from "ramda";
import { Line, Point, ClosedPath, Vec2 } from "../types";

const EPSILON = 1;

export function getDistance(a: Point, b: Point): number {
  const differenceVec = getSubVec(a, b);
  return getMagnitude(differenceVec);
}

export function getMagnitude(vec: Vec2): number {
  return Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
}

export function getScaledVec(vec: Vec2, factor: number): Vec2 {
  return [vec[0] * factor, vec[1] * factor];
}

export function getLengthVec(vec: Vec2, length: number): Vec2 {
  return getScaledVec(getNormalizedVec(vec), length);
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

export function getVecLine(base: Point, vec: Vec2): Line {
  const endPoint = getAddVec(base, vec);
  return [base, endPoint];
}

export function getVecLineWithLength(
  base: Point,
  vec: Vec2,
  length: number
): Line {
  const lengthVec = getLengthVec(vec, length);
  const endPoint = getAddVec(base, lengthVec);
  return [base, endPoint];
}

export function getAddVec(vecA: Vec2, vecB: Vec2): Vec2 {
  return [vecA[0] + vecB[0], vecA[1] + vecB[1]];
}

export function getSubVec(vecA: Vec2, vecB: Vec2): Vec2 {
  return [vecA[0] - vecB[0], vecA[1] - vecB[1]];
}

export function getInvertedVec(vec: Vec2): Vec2 {
  return [-vec[0], -vec[1]];
}

export function getRotatedVec(vec: Vec2, rotationRadians: number): Vec2 {
  const x =
    vec[0] * Math.cos(rotationRadians) - vec[1] * Math.sin(rotationRadians);
  const y =
    vec[0] * Math.sin(rotationRadians) + vec[1] * Math.cos(rotationRadians);
  return [x, y];
}

export function getPerpendicularVec(vec: Vec2): Vec2 {
  return getNormalizedVec([-vec[1], vec[0]]);
}

export function getParallelLine(line: Line, offset: number): Line {
  const lineVec = getLineVec(line);
  const offsetVec = getScaledVec(getPerpendicularVec(lineVec), offset);
  const pointA = getAddVec(line[0], offsetVec);
  const pointB = getAddVec(line[1], offsetVec);
  return [pointA, pointB];
}

export function getPointLineDistance(line: Line, point: Point): number {
  const a = line[0];
  const b = line[1];
  const AToB = [b[0] - a[0], b[1] - a[1]];
  const BToE = [point[0] - b[0], point[1] - b[1]];
  const AToE = [point[0] - a[0], point[1] - a[1]];
  const ABDotBE = AToB[0] * BToE[0] + AToB[1] * BToE[1];
  const ABDotAE = AToB[0] * AToE[0] + AToB[1] * AToE[1];

  // B is closest
  if (ABDotBE > 0) {
    const dy = point[1] - b[1];
    const dx = point[0] - b[0];
    return Math.sqrt(dx * dx + dy * dy);
  }
  // A is closest
  else if (ABDotAE < 0) {
    const dy = point[1] - a[1];
    const dx = point[0] - a[0];
    return Math.sqrt(dx * dx + dy * dy);
  }
  // Perpendicular is closest
  else {
    const x1 = AToB[0];
    const y1 = AToB[1];
    const x2 = AToE[0];
    const y2 = AToE[1];
    const mod = Math.sqrt(x1 * x1 + y1 * y1);
    return Math.abs(x1 * y2 - y1 * x2) / mod;
  }
}

export function getLinesIntersectPoint(
  lineA: Line,
  lineB: Line
): Point | undefined {
  const x1 = lineA[0][0];
  const x2 = lineA[1][0];
  const x3 = lineB[0][0];
  const x4 = lineB[1][0];
  const y1 = lineA[0][1];
  const y2 = lineA[1][1];
  const y3 = lineB[0][1];
  const y4 = lineB[1][1];
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denominator === 0) return;
  const xNumerator =
    (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
  const yNumerator =
    (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
  const x = xNumerator / denominator;
  const y = yNumerator / denominator;
  return [x, y];
}

export function getThickenedPathClosedPath(
  pathPoints: Array<Point>,
  thickness: number
): ClosedPath {
  const offset = thickness / 2;
  const getSegmentOffsetLines = (segment: Line) => {
    const rightLine = getParallelLine(segment, offset);
    const leftLine = getParallelLine(segment, -offset);
    return { rightLine, leftLine };
  };
  const miterSegmentsLinesPairs = (
    segmentsLinesPair: Array<{ leftLine: Line; rightLine: Line }>
  ) => {
    const leftLineA = segmentsLinesPair[0].leftLine;
    const rightLineA = segmentsLinesPair[0].rightLine;
    const leftLineB = segmentsLinesPair[1].leftLine;
    const rightLineB = segmentsLinesPair[1].rightLine;
    const leftIntersect = getLinesIntersectPoint(leftLineA, leftLineB);
    const rightIntersect = getLinesIntersectPoint(rightLineA, rightLineB);
    if (isNotNil(leftIntersect)) {
      leftLineA[1][0] = leftIntersect[0];
      leftLineA[1][1] = leftIntersect[1];
      leftLineB[0][0] = leftIntersect[0];
      leftLineB[0][1] = leftIntersect[1];
    }
    if (isNotNil(rightIntersect)) {
      rightLineA[1][0] = rightIntersect[0];
      rightLineA[1][1] = rightIntersect[1];
      rightLineB[0][0] = rightIntersect[0];
      rightLineB[0][1] = rightIntersect[1];
    }
  };
  const segments = aperture(2, pathPoints);
  const segmentsOffsetLines = map(getSegmentOffsetLines, segments);
  const segmentsLinesPairs = aperture(2, segmentsOffsetLines);
  forEach(miterSegmentsLinesPairs, segmentsLinesPairs);
  const leftLines = map(prop("leftLine"), segmentsOffsetLines);
  const rightLines = map(prop("rightLine"), segmentsOffsetLines);
  const leftLinePoints = getPathLinesPoints(leftLines);
  const rightLinePoints = getPathLinesPoints(rightLines);
  const closedPath = concat(leftLinePoints, reverse(rightLinePoints));
  return closedPath;
}

export function getPathLinesPoints(pathLines: Array<Line>): Array<Point> {
  if (isEmpty(pathLines)) return [];
  if (!isPathLinesValid(pathLines)) throw Error("Path lines invalid.");
  const getFirstPointInLine = (line: Line) => line[0];
  const pathPoints = map(getFirstPointInLine, pathLines);
  pathPoints.push(last(pathLines)![1]);
  return pathPoints;
}

export function getPointsPathLines(points: Array<Point>): Array<Line> {
  if (isEmpty(points)) return [];
  if (points.length < 2) return [];
  return aperture(2, points);
}

export function getBufferPoints(buffer: Array<number>): Array<Point> {
  if (buffer.length % 2 !== 0) {
    throw Error("Trying to convert odd length buffer to points.");
  }
  return splitEvery(2, buffer) as Array<Point>;
}

export function isPathLinesValid(pathLines: Array<Line>): boolean {
  const pathLinesPairs = aperture(2, pathLines);
  const isAllLinesTipsCoincident = all(
    (pathLinesPair) =>
      isCoincidentLinesTips(pathLinesPair[0], pathLinesPair[1]),
    pathLinesPairs
  );
  return isAllLinesTipsCoincident;
}

export function isCoincidentLinesTips(lineA: Line, lineB: Line): boolean {
  return (
    isCoincidentPoint(lineA[0], lineB[0]) ||
    isCoincidentPoint(lineA[1], lineB[0]) ||
    isCoincidentPoint(lineA[0], lineB[1]) ||
    isCoincidentPoint(lineA[1], lineB[1])
  );
}

export function isCoincidentPoint(pointA: Point, pointB: Point): boolean {
  return (
    Math.abs(pointA[0] - pointB[0]) <= EPSILON &&
    Math.abs(pointA[1] - pointB[1]) <= EPSILON
  );
}
