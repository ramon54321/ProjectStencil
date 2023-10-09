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

// -- Drawing
export type RGB = [number, number, number];
