import { join, map, splitEvery } from "ramda";
import { Point, Tag } from "./types";

export function roundPoints(points: Array<Point>): Array<Point> {
  return map(roundPoint, points);
}

export function roundPoint(point: Point): Point {
  return [Math.round(point[0]), Math.round(point[1])];
}

export function tagToTagString(tag: Tag): string {
  return join(":", tag);
}

export function assert(expression: boolean, message?: string) {
  if (!expression) throw Error(message);
}
