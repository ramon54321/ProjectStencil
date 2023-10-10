import { filter, isEmpty, map, pipe, values } from "ramda";
import { getPathTriangulation } from "../meshing/meshing";
import {
  Path,
  LayoutTraversable,
  Tag,
  Composition,
  CompositionLayer,
} from "../types";
import { tagToTagString } from "../utils";

const stylesheet = {
  styles: {
    "road:small": {
      stroke: [0.8, 0.2, 0.2],
      fill: [0.7, 0.7, 0.7],
    },
    "road:medium": {
      stroke: [0.8, 0.6, 0.2],
      fill: [0.4, 0.8, 0.4],
    },
  },
} as any;

export function composeLayoutTraversable(
  layout: LayoutTraversable
): Composition {
  /*
   * Composition
   * 1) Create required meshes
   * 2) Sequence meshes into batches
   * */
  const composition: Composition = [];

  // -- Roads
  const roadSmallTag: Tag = ["road", "small"];
  const roadMediumTag: Tag = ["road", "medium"];
  const roadSmallPaths = getPathsWithTag(layout.pathMap, roadSmallTag);
  const roadMediumPaths = getPathsWithTag(layout.pathMap, roadMediumTag);

  // Stroke
  const roadSmallStrokeTriangulations = map(
    (path) => getPathTriangulation(path, 12),
    roadSmallPaths
  );
  const roadSmallStrokeCompositionLayer: CompositionLayer = {
    triangulations: roadSmallStrokeTriangulations,
    style: { color: stylesheet.styles[tagToTagString(roadSmallTag)].stroke },
  };
  composition.push(roadSmallStrokeCompositionLayer);
  const roadMediumStrokeTriangulations = map(
    (path) => getPathTriangulation(path, 14),
    roadMediumPaths
  );
  const roadMediumStrokeCompositionLayer: CompositionLayer = {
    triangulations: roadMediumStrokeTriangulations,
    style: { color: stylesheet.styles[tagToTagString(roadMediumTag)].stroke },
  };
  composition.push(roadMediumStrokeCompositionLayer);

  // Inner
  const roadSmallInnerTriangulations = map(
    (path) => getPathTriangulation(path, 8),
    roadSmallPaths
  );
  const roadSmallInnerCompositionLayer: CompositionLayer = {
    triangulations: roadSmallInnerTriangulations,
    style: { color: stylesheet.styles[tagToTagString(roadSmallTag)].fill },
  };
  composition.push(roadSmallInnerCompositionLayer);
  const roadMediumInnerTriangulations = map(
    (path) => getPathTriangulation(path, 10),
    roadMediumPaths
  );
  const roadMediumInnerCompositionLayer: CompositionLayer = {
    triangulations: roadMediumInnerTriangulations,
    style: { color: stylesheet.styles[tagToTagString(roadMediumTag)].fill },
  };
  composition.push(roadMediumInnerCompositionLayer);

  return composition;
}

function getPathsWithTag(pathMap: Record<string, Path>, tag: Tag): Array<Path> {
  const isValidPath = (path: Path) => {
    const isValidCategory = (t: Tag) => t[0] === tag[0];
    const isValidValue = (t: Tag) => tag[1] === "*" || t[1] === tag[1];
    const matchingTags = pipe(
      filter(isValidCategory),
      filter(isValidValue)
    )(path.tags);
    return !isEmpty(matchingTags);
  };
  return filter(isValidPath, values(pathMap));
}
