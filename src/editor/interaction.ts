import { isEmpty, isNil, isNotNil, values } from "ramda";
import { getDistance } from "../geometry/geometry";
import { getNearbyPaths, getNearestNode } from "../layout/layout";
import {
  EditorState,
  InteractPhase,
  InteractPhaseHandler,
  KeyEvent,
  Point,
} from "../types";

const CLICK_DETECTION_DISTANCE = 20;

const interactPhaseDefs: Record<InteractPhase, InteractPhaseHandler> = {
  TryPressNode: {
    isEditorStateValid: (editorState: EditorState): boolean => {
      return (
        isNil(editorState.interaction.pressedNode) &&
        isNil(editorState.interaction.selectedNode) &&
        isNil(editorState.interaction.selectedPaths) &&
        isNil(editorState.interaction.selectedPath) &&
        isNil(editorState.interaction.selectedPathNode)
      );
    },
    onMouseDown: (editorState: EditorState, mousePoint: Point) => {
      const [nearestNode, nearestNodeDistance] = getNearestNode(
        values(editorState.layoutTraversable.nodeMap),
        mousePoint
      );
      if (nearestNodeDistance <= CLICK_DETECTION_DISTANCE) {
        editorState.interaction.pressedNode = nearestNode;
      }
    },
    onMouseMove: (editorState: EditorState, mousePoint: Point) => {
      if (isNotNil(editorState.interaction.pressedNode)) {
        editorState.interaction.pressedNode.point[0] = mousePoint[0];
        editorState.interaction.pressedNode.point[1] = mousePoint[1];
      }
    },
    onMouseUp: (editorState: EditorState, mousePoint: Point) => {
      if (
        !editorState.interaction.didMouseMove &&
        isNotNil(editorState.interaction.pressedNode)
      ) {
        editorState.interaction.selectedNode =
          editorState.interaction.pressedNode;
        editorState.interaction.interactPhase = "TrySelectPath";
      }
      editorState.interaction.pressedNode = undefined;
    },
    onKeyDown: (
      editorState: EditorState,
      mousePoint: Point,
      keyEvent: KeyEvent
    ) => {},
    onKeyUp: (
      editorState: EditorState,
      mousePoint: Point,
      keyEvent: KeyEvent
    ) => {},
  },

  TrySelectPath: {
    isEditorStateValid: (editorState: EditorState): boolean => {
      return (
        isNil(editorState.interaction.pressedNode) &&
        isNotNil(editorState.interaction.selectedNode) &&
        isNil(editorState.interaction.selectedPaths) &&
        isNil(editorState.interaction.selectedPath) &&
        isNil(editorState.interaction.selectedPathNode)
      );
    },
    onMouseDown: (editorState: EditorState, mousePoint: Point) => {
      const nearbyPaths = getNearbyPaths(
        CLICK_DETECTION_DISTANCE,
        mousePoint,
        editorState.interaction.selectedNode!.paths
      );
      if (!isEmpty(nearbyPaths)) {
        editorState.interaction.selectedPaths = nearbyPaths;
      }
      if (
        isNotNil(editorState.interaction.selectedPaths) &&
        !isEmpty(editorState.interaction.selectedPaths)
      ) {
        editorState.interaction.selectedPath =
          editorState.interaction.selectedPaths[0];
      }
    },
    onMouseMove: (editorState: EditorState, mousePoint: Point) => {
      const distanceFromClick = getDistance(
        editorState.interaction.clickDownPoint,
        mousePoint
      );
      if (isNotNil(editorState.interaction.selectedPaths)) {
        const index =
          Math.floor(distanceFromClick / 60) %
          editorState.interaction.selectedPaths.length;
        editorState.interaction.selectedPath =
          editorState.interaction.selectedPaths[index];
      }
    },
    onMouseUp: (editorState: EditorState, mousePoint: Point) => {
      if (isNotNil(editorState.interaction.selectedPath)) {
        editorState.interaction.interactPhase = "TrySelectPathNode";
      } else {
        editorState.interaction.interactPhase = "TryPressNode";
      }
      editorState.interaction.selectedNode = undefined;
      editorState.interaction.selectedPaths = undefined;
    },
    onKeyDown: (
      editorState: EditorState,
      mousePoint: Point,
      keyEvent: KeyEvent
    ) => {},
    onKeyUp: (
      editorState: EditorState,
      mousePoint: Point,
      keyEvent: KeyEvent
    ) => {},
  },

  TrySelectPathNode: {
    isEditorStateValid: (editorState: EditorState): boolean => {
      return (
        isNil(editorState.interaction.pressedNode) &&
        isNil(editorState.interaction.selectedNode) &&
        isNil(editorState.interaction.selectedPaths) &&
        isNotNil(editorState.interaction.selectedPath) &&
        isNil(editorState.interaction.selectedPathNode)
      );
    },
    onMouseDown: (editorState: EditorState, mousePoint: Point) => {
      const [nearestPathNode, nearestPathNodeDistance] = getNearestNode(
        editorState.interaction.selectedPath!.nodes,
        mousePoint
      );
      if (nearestPathNodeDistance <= CLICK_DETECTION_DISTANCE) {
        editorState.interaction.selectedPathNode = nearestPathNode;
      }
    },
    onMouseMove: (editorState: EditorState, mousePoint: Point) => {},
    onMouseUp: (editorState: EditorState, mousePoint: Point) => {
      if (isNotNil(editorState.interaction.selectedPathNode)) {
        console.log("Some selected path node state");
        // interaction.interactPhase = "TrySelectPathNode";
      } else {
        editorState.interaction.selectedPath = undefined;
        editorState.interaction.interactPhase = "TryPressNode";
      }
    },
    onKeyDown: (
      editorState: EditorState,
      mousePoint: Point,
      keyEvent: KeyEvent
    ) => {},
    onKeyUp: (
      editorState: EditorState,
      mousePoint: Point,
      keyEvent: KeyEvent
    ) => {},
  },
};

export default interactPhaseDefs;
