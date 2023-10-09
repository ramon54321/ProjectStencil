import { filter, flatten, isEmpty, map, pipe, values } from "ramda";
import { getPathTriangulation } from "../meshing/meshing";
import { Path, LayoutTraversable, Tag, Triangulation } from "../types";

export function composeLayoutTraversable(
  layout: LayoutTraversable
): Array<Array<Triangulation>> {
  const triangulationsLayers: Array<Array<Triangulation>> = [];
  /*
   * Composition
   * 1) Create required meshes
   * 2) Sequence meshes into batches
   * */
  // -- Roads
  const roadSmallPaths = getPathsWithTag(layout.pathMap, ["road", "small"]);
  const roadMediumPaths = getPathsWithTag(layout.pathMap, ["road", "medium"]);

  const roadSmallStrokeTriangulations = map(
    (path) => getPathTriangulation(path, 12),
    roadSmallPaths
  );
  const roadMediumStrokeTriangulations = map(
    (path) => getPathTriangulation(path, 14),
    roadMediumPaths
  );
  triangulationsLayers.push(
    flatten([roadSmallStrokeTriangulations, roadMediumStrokeTriangulations])
  );

  const roadSmallInnerTriangulations = map(
    (path) => getPathTriangulation(path, 8),
    roadSmallPaths
  );
  const roadMediumInnerTriangulations = map(
    (path) => getPathTriangulation(path, 10),
    roadMediumPaths
  );
  triangulationsLayers.push(
    flatten([roadSmallInnerTriangulations, roadMediumInnerTriangulations])
  );

  return triangulationsLayers;
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
