import { forEach, indexOf, map, mapObjIndexed, values } from "ramda";
import { LayoutTraversable, LayoutSerializable, Node, Path } from "../types";

export function layoutSerializableToTraversable(
  layout: LayoutSerializable
): LayoutTraversable {
  const nodeMap = mapObjIndexed(
    (pin, key) => ({
      id: key,
      point: pin.point,
      nodes: [],
      paths: [],
      payload: {},
    }),
    layout.pinMap
  );
  const pathMap = map(
    (way) => ({ nodes: map((pin) => nodeMap[pin], way.pins) }),
    layout.wayMap
  );
  const addPathToNodesOfPath = (path: Path) => {
    forEach((node: Node) => node.paths.push(path), path.nodes);
  };
  forEach(addPathToNodesOfPath, values(pathMap));
  const addNodesToNodes = (node: Node) => {
    const addNodesOfPathToNode = (path: Path) => {
      const indexOfNodeInPath = indexOf(node, path.nodes);
      if (indexOfNodeInPath === -1)
        throw Error("Node not in path but path was in node.");
      if (path.nodes.length === 1) return;
      if (indexOfNodeInPath === 0) {
        node.nodes.push(path.nodes[indexOfNodeInPath + 1]);
      } else if (indexOfNodeInPath === path.nodes.length - 1) {
        node.nodes.push(path.nodes[indexOfNodeInPath - 1]);
      } else {
        node.nodes.push(path.nodes[indexOfNodeInPath + 1]);
        node.nodes.push(path.nodes[indexOfNodeInPath - 1]);
      }
    };
    forEach(addNodesOfPathToNode, node.paths);
  };
  forEach(addNodesToNodes, values(nodeMap as any));
  return {
    nodeMap,
    pathMap,
  };
}

export function layoutTraversableToSerializable(
  layout: LayoutTraversable
): LayoutSerializable {
  const pinMap = map((node) => ({ point: node.point }), layout.nodeMap);
  const wayMap = map(
    (path) => ({ pins: map((node) => node.id, path.nodes) }),
    layout.pathMap
  );
  return {
    pinMap,
    wayMap,
  };
}
