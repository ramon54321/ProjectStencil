import { map, splitEvery } from "ramda";
import { Point } from "./types";

export function roundPoints(points: Array<Point>): Array<Point> {
  return map(roundPoint, points);
}

export function roundPoint(point: Point): Point {
  return [Math.round(point[0]), Math.round(point[1])];
}

export function bufferToPoints(buffer: Array<number>): Array<Point> {
  if (buffer.length % 2 !== 0) {
    throw Error("Trying to convert odd length buffer to points.");
  }
  return splitEvery(2, buffer) as Array<Point>;
}
