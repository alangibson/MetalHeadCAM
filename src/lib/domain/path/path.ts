import { Polyshape } from "$lib/geometry/polyshape/polyshape";


// TODO move all geometric methods to Polyshape
// TODO since this class just adds a direction to a Polyshape,
//      can we put the direction stuff in Cut?

/**
 * A tool path. 
 * 
 * Expands on Polyshape by adding the concept of travel direction.
 */
export class Path extends Polyshape {

	// Direction starts out as undefined since shapes can be oriented
	// in either direction at the time they're added.
	#direction: DirectionEnum;

	constructor(shapes: Shape[]) {
		// super(shapes);
	}

	get direction(): DirectionEnum {
		return this.#direction;
	}

	set direction(direction: DirectionEnum) {
		for (let shape of this.children) {
			shape.direction = direction;
		}
		this.#direction = direction;
	}

	// get startPoint(): Point {
	// 	console.log(chainStartPoint(this));
	// 	return new Point(chainStartPoint(this));
	// }

	// get endPoint(): Point {
	// 	return new Point(chainEndPoint(this));
	// }

	get boundary(): Boundary {
		return chainBoundary(this);
	}

	/** Returns true if, starting with first shape, each subsequent shape is connected end-to-start point */
	// closed(): boolean {
	// 	return chainIsClosed(this);
	// }

	contains(that: Chain): boolean {
		return chainContains(this, that);
	}

	// add(shape: Shape) {
	// 	this.children.push(shape);
	// }

	/**
	 * Sort shapes, using start and end points, in correct order according
	 * to this._direction
	 */
	private sort() {
		// TODO
		// Example usage:
		// const shapes = [
		//     { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
		//     { start: { x: 1, y: 0 }, end: { x: 1, y: 1 } },
		//     { start: { x: 1, y: 1 }, end: { x: 0, y: 1 } },
		//     { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } },
		// ];
		// const sortedShapesClockwise = sortShapes(shapes, "clockwise");
		// console.log("Clockwise:", sortedShapesClockwise);
		// const sortedShapesCounterClockwise = sortShapes(shapes, "counterclockwise");
		// console.log("Counterclockwise:", sortedShapesCounterClockwise);
		this.children = sortShapesInDirection(this.children, this.#direction);
	}
}
