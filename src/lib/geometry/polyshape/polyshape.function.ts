import { Boundary } from "../boundary/boundary";
import { Polyshape } from "./polyshape";

export function polyshapeIsClosed(polyshape: Polyshape): boolean {
  const start = polyshape.shapes[0].startPoint;
  const end = polyshape.shapes[polyshape.shapes.length - 1].endPoint;
  // TODO get tolerance from configuration
  return start.coincident(end, 0.005);
}

export function polyshapeBoundary(chain: Polyshape): Boundary {
	const boundary = new Boundary({ startPoint: { x: 0, y: 0 }, endPoint: { x: 0, y: 0 } });
	chain.shapes.forEach((shape) => boundary.join(shape.boundary));
	return boundary;
}