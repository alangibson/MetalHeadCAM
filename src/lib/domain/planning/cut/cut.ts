import { Entity } from "$lib/entity";
import { Boundary } from "$lib/geometry/boundary/boundary";
import { OrientationEnum } from "$lib/geometry/geometry/geometry.enum";
import type { Point } from "$lib/geometry/point/point";
import { Polyshape } from "$lib/geometry/polyshape/polyshape";
import type { TransformData } from "$lib/geometry/transform/transform.data";
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
export class Cut extends Entity {
	// Children
	rapidIn?: Rapid;
	leadIn?: Lead;
	path: Polyshape;
	leadOut?: Lead;
    // Direction the Path is cut
    orientation: OrientationEnum = OrientationEnum.COUNTERCLOCKWISE;

	constructor({ path, leadIn, leadOut, rapidIn }: CutData) {
		super();
		this.path = new Polyshape(path);
		if (leadIn)
			this.leadIn = new Lead(leadIn);
		if (leadOut)
			this.leadOut = new Lead(leadOut);
		if (rapidIn)
			this.rapidIn = new Rapid(rapidIn);
	}

	get startPoint(): Point {
		return this.path.startPoint;
	}

	get endPoint(): Point {
		return this.path.endPoint;
	}

	get boundary(): Boundary {
		// TODO include Leads
		// const children = [this.leadIn, this.path, this.leadOut];
		const children = [this.path];
        return children.reduce<Boundary>((bb, child) => bb.join(child.boundary),
            new Boundary({
                startPoint: { x: 0, y: 0 },
                endPoint: { x: 0, y: 0 },
            }))
    }

    transform(transform: TransformData): void {
		// TODO include Leads
		// const children = [this.leadIn, this.path, this.leadOut];
		const children = [this.path];
        children.forEach(child => child.transform(transform));
    }
}
