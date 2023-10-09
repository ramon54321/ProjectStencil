import {
  Application,
  Container,
  DRAW_MODES,
  Geometry,
  Mesh,
  Shader,
} from "pixi.js";
import { flatten, forEach, isNotNil } from "ramda";
import { getAddVec, getNormalizedVec, getScaledVec } from "./geometry/geometry";
import {
  Line,
  Point,
  RGB,
  TriangleIndices,
  Triangulation,
  Vec2,
} from "./types";
import { roundPoints } from "./utils";

export function createMesh(
  points: Array<Point>,
  indices: Array<number>
): Mesh<Shader> {
  const roundedPoints = roundPoints(points);
  const geometry = new Geometry()
    .addAttribute("aVertexPosition", flatten(roundedPoints), 2)
    .addIndex(indices);
  const shader = Shader.from(
    `
    precision mediump float;
    attribute vec2 aVertexPosition;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    void main() {
        gl_PointSize = 20.0;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }`,

    ` precision mediump float;

    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`
  );
  const mesh = new Mesh(geometry, shader);
  return mesh;
}

const SHADER_SRC_DEBUG = [
  `
    precision mediump float;
    attribute vec2 aVertexPosition;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    void main() {
        gl_PointSize = 20.0;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
  `,
  `
    precision mediump float;

    uniform vec3 color;

    void main() {
        gl_FragColor = vec4(color, 1.0);
    }
  `,
];

export function debugDrawPoint(
  app: Application,
  point: Point,
  color?: RGB
): Mesh<Shader> {
  const shader = Shader.from(SHADER_SRC_DEBUG[0], SHADER_SRC_DEBUG[1]);
  const geometry = new Geometry().addAttribute(
    "aVertexPosition",
    flatten(point),
    2
  );
  const mesh = new Mesh(geometry, shader);
  mesh.shader.uniforms.color = isNotNil(color) ? color : [0.9, 0.3, 0.9];
  mesh.drawMode = DRAW_MODES.POINTS;
  app.stage.addChild(mesh);
  return mesh;
}

export function debugDrawVec(
  app: Application,
  base: Point,
  vec: Vec2
): Mesh<Shader> {
  const length = 40;
  const vecScaled = getScaledVec(getNormalizedVec(vec), length);
  const tipPoint = getAddVec(base, vecScaled);
  return debugDrawLine(app, [base, tipPoint], [0.4, 0.5, 0.9]);
}

export function debugDrawLine(
  app: Application,
  line: Line,
  color?: RGB
): Mesh<Shader> {
  const shader = Shader.from(SHADER_SRC_DEBUG[0], SHADER_SRC_DEBUG[1]);
  const geometry = new Geometry().addAttribute(
    "aVertexPosition",
    flatten(line),
    2
  );
  const mesh = new Mesh(geometry, shader);
  mesh.shader.uniforms.color = isNotNil(color) ? color : [0.3, 0.9, 0.4];
  mesh.drawMode = DRAW_MODES.LINE_STRIP;
  app.stage.addChild(mesh);
  return mesh;
}

export function debugDrawPath(
  app: Application,
  points: Array<Point>,
  color?: RGB
): Mesh<Shader> {
  const shader = Shader.from(SHADER_SRC_DEBUG[0], SHADER_SRC_DEBUG[1]);
  const geometry = new Geometry().addAttribute(
    "aVertexPosition",
    flatten(points),
    2
  );
  const mesh = new Mesh(geometry, shader);
  mesh.shader.uniforms.color = isNotNil(color) ? color : [0.5, 0.9, 0.8];
  mesh.drawMode = DRAW_MODES.LINE_STRIP;
  app.stage.addChild(mesh);
  return mesh;
}

export function debugDrawClosedPath(
  app: Application,
  points: Array<Point>,
  color?: RGB
): Mesh<Shader> {
  const shader = Shader.from(SHADER_SRC_DEBUG[0], SHADER_SRC_DEBUG[1]);
  const geometry = new Geometry().addAttribute(
    "aVertexPosition",
    flatten(points),
    2
  );
  const mesh = new Mesh(geometry, shader);
  mesh.shader.uniforms.color = isNotNil(color) ? color : [0.5, 0.9, 0.8];
  mesh.drawMode = DRAW_MODES.LINE_LOOP;
  app.stage.addChild(mesh);
  return mesh;
}

export function debugDrawTriangulation(
  app: Application,
  triangulation: Triangulation,
  color?: RGB,
  drawMode?: DRAW_MODES
): Container {
  const shader = Shader.from(SHADER_SRC_DEBUG[0], SHADER_SRC_DEBUG[1]);
  shader.uniforms.color = isNotNil(color) ? color : [0.5, 0.9, 0.8];
  const parent = new Container();
  const drawTriangle = (triangleIndices: TriangleIndices) => {
    const geometry = new Geometry()
      .addAttribute(
        "aVertexPosition",
        flatten(triangulation.trianglesPoints),
        2
      )
      .addIndex(flatten(triangleIndices));
    const mesh = new Mesh(geometry, shader);
    mesh.drawMode = isNotNil(drawMode) ? drawMode : DRAW_MODES.LINE_LOOP;
    parent.addChild(mesh);
  };
  forEach(drawTriangle, triangulation.trianglesIndices);
  app.stage.addChild(parent);
  return parent;
}
