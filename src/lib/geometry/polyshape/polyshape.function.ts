import { Polyshape } from "./polyshape";

export function polyshapeIsClosed(polyshape: Polyshape): boolean {
  const start = polyshape.shapes[0].startPoint;
  const end = polyshape.shapes[polyshape.shapes.length - 1].endPoint;
  // TODO get tolerance from configuration
  return start.coincident(end, 0.005);
}