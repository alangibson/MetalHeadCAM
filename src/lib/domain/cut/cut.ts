import type { Polyshape } from "$lib/geometry/polyshape/polyshape";

/**
 * A Cut
 * - has optional Rapid to startPoint
 * - has optional Lead in to cut
 * - has a cut path defined by a Polyshape
 * - has a direction (clockedness) of cut path
 * - has optional Lead out of cut
 * - has optional Rapid away from endPoint
 */
export class Cut {
	// Children
	rapidTo?: Rapid;
	leadIn?: Lead;
	path: Polyshape;
	leadOut?: Lead;
    // Direction the Path is cut
    direction: DirectionEnum;

	constructor({ path, leadIn, leadOut, rapidTo }: CutData) {
		this.path = path;
		this.leadIn = leadIn;
		this.leadOut = leadOut;
		this.rapidTo = rapidTo;
	}

	get startPoint(): Point {
		return this.path.chain.startPoint;
	}

	get endPoint(): Point {
		return this.path.chain.endPoint;
	}
}
