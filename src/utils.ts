import { map, splitEvery } from "ramda";
import { Point } from "./types";

export function roundPoints(points: Array<Point>): Array<Point> {
  return map(roundPoint, points);
}

export function roundPoint(point: Point): Point {
  return [Math.round(point[0]), Math.round(point[1])];
}
