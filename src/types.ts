import { Application } from "pixi.js";

// -- Geometry
export type Vec2 = [number, number];
export type Point = [number, number];
export type Line = [Point, Point];
export type ClosedPath = Array<Point>;

// -- Serialization
export type LayoutSerializable = {
  pinMap: Record<string, Pin>;
  wayMap: Record<string, Way>;
};
export type LayoutTraversable = {
  nodeMap: Record<string, Node>;
  pathMap: Record<string, Path>;
};

export type Pin = {
  point: Point;
};
export type Way = {
  pins: Array<string>;
  tags?: Array<Tag>;
};
export type Tag = [string, any];

export type Node = {
  id: string;
  point: Point;
  nodes: Array<Node>;
  paths: Array<Path>;
  payload: any;
};
export type Path = {
  nodes: Array<Node>;
  tags: Array<Tag>;
};

// -- Mesh
export type TriangleIndices = [number, number, number];
export type Triangulation = {
  trianglesIndices: Array<TriangleIndices>;
  trianglesPoints: Array<Point>;
};

// -- Composition
export type CompositionLayer = {
  triangulations: Array<Triangulation>;
  style: { color: RGB };
};
export type Composition = Array<CompositionLayer>;

// -- Drawing
export type RGB = [number, number, number];

// -- Editor
export type EditorState = {
  app: Application;
  layoutTraversable: LayoutTraversable;
  interaction: {
    clickDownPoint: Point;
    pressedNode: Node | undefined;
    selectedNode: Node | undefined;
    selectedPaths: Array<Path> | undefined;
    selectedPath: Path | undefined;
    selectedPathNode: Node | undefined;
    interactPhase: InteractPhase;
  };
};
export type InteractPhase =
  | "TryPressNode"
  | "TrySelectNode"
  | "TrySelectPath"
  | "TrySelectPathNode";
export type InteractPhaseHandler = {
  isEditorStateValid: (editorState: EditorState) => boolean;
  onMouseDown: (editorState: EditorState, mousePoint: Point) => void;
  onMouseMove: (editorState: EditorState, mousePoint: Point) => void;
  onMouseUp: (editorState: EditorState, mousePoint: Point) => void;
  onKeyDown: (
    editorState: EditorState,
    mousePoint: Point,
    keyEvent: KeyEvent
  ) => void;
  onKeyUp: (
    editorState: EditorState,
    mousePoint: Point,
    keyEvent: KeyEvent
  ) => void;
};
export type KeyEvent = {
  key: string;
  shiftKey: boolean;
  metaKey: boolean;
};
