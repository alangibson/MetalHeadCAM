import { ArcDirectionEnum } from "$lib/geometry/arc/arc.enum";
import type { Point } from "$lib/geometry/point/point";
import { Polyshape } from "$lib/geometry/polyshape/polyshape";
import { Lead } from "../lead/lead";
import { Rapid } from "../rapid/rapid";
import type { CutData } from "./cut.data";

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
	rapidIn?: Rapid;
	leadIn?: Lead;
	path: Polyshape;
	leadOut?: Lead;
    // Direction the Path is cut
    direction: ArcDirectionEnum = ArcDirectionEnum.CCW;

	constructor({ path, leadIn, leadOut, rapidIn }: CutData) {
		this.rapidIn = new Rapid(rapidIn);
		this.leadIn = new Lead(leadIn);
		this.path = new Polyshape(path);
		this.leadOut = new Lead(leadOut);
	}

	get startPoint(): Point {
		return this.path.startPoint;
	}

	get endPoint(): Point {
		return this.path.endPoint;
	}
}
