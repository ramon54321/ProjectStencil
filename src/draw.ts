import { Application, DRAW_MODES, Geometry, Mesh, Shader } from "pixi.js";
import { flatten } from "ramda";
import { Point } from "./types";
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

export function debugDrawPoint(app: Application, point: Point): Mesh<Shader> {
  const shader = Shader.from(SHADER_SRC_DEBUG[0], SHADER_SRC_DEBUG[1]);
  const geometry = new Geometry().addAttribute(
    "aVertexPosition",
    flatten(point),
    2
  );
  const mesh = new Mesh(geometry, shader);
  mesh.shader.uniforms.color = [
    0.4 + Math.random() * 0.6,
    0.4 + Math.random() * 0.6,
    0.4 + Math.random() * 0.6,
  ];
  mesh.drawMode = DRAW_MODES.POINTS;
  app.stage.addChild(mesh);
  return mesh;
}

export function debugDrawLine(
  app: Application,
  points: Array<Point>
): Mesh<Shader> {
  const shader = Shader.from(SHADER_SRC_DEBUG[0], SHADER_SRC_DEBUG[1]);
  const geometry = new Geometry().addAttribute(
    "aVertexPosition",
    flatten(points),
    2
  );
  const mesh = new Mesh(geometry, shader);
  mesh.shader.uniforms.color = [
    0.4 + Math.random() * 0.6,
    0.4 + Math.random() * 0.6,
    0.4 + Math.random() * 0.6,
  ];
  mesh.drawMode = DRAW_MODES.LINE_STRIP;
  app.stage.addChild(mesh);
  return mesh;
}
