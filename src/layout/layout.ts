import { forEach, isNil, map } from "ramda";
import {
  getDistance,
  getPointLineDistance,
  getPointsPathLines,
} from "../geometry/geometry";
import { Point, Node, Path, Line } from "../types";

export function getNearestNode(
  nodes: Array<Node>,
  point: Point
): [Node | undefined, number] {
  let nearestNode: Node | undefined = undefined;
  let nearestDistance = Infinity;
  const evaluateNode = (node: Node) => {
    const distance = getDistance(point, node.point);
    if (isNil(nearestNode) || distance < nearestDistance) {
      nearestNode = node;
      nearestDistance = distance;
    }
  };
  forEach(evaluateNode, nodes);
  return [nearestNode, nearestDistance];
}

export function getNearbyPaths(
  clickDetectionDistance: number,
  point: Point,
  paths: Array<Path>
): Array<Path> {
  const nearbyPaths: Array<Path> = [];
  const evaluatePath = (path: Path) => {
    const getNearestLineDistance = (lines: Array<Line>): number => {
      let nearestDistance = Infinity;
      const evaluateLine = (line: Line) => {
        const distance = getPointLineDistance(line, point);
        if (distance <= nearestDistance) {
          nearestDistance = distance;
        }
      };
      forEach(evaluateLine, lines);
      return nearestDistance;
    };
    const pathDistance = getNearestLineDistance(
      getPointsPathLines(map((node) => node.point, path.nodes))
    );
    if (pathDistance <= clickDetectionDistance) {
      nearbyPaths.push(path);
    }
  };
  forEach(evaluatePath, paths);
  return nearbyPaths;
}
