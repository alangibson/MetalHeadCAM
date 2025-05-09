import { Entity } from "$lib/entity";
import { Boundary } from "$lib/geometry/boundary/boundary";
import { OrientationEnum } from "$lib/geometry/geometry/geometry.enum";
import type { Point } from "$lib/geometry/point/point";
import { Polyshape } from "$lib/geometry/polyshape/polyshape";
import type { TransformData } from "$lib/geometry/transform/transform.data";
import { Lead } from "../lead/lead";
import { Rapid } from "../rapid/rapid";
import type { CutData } from "./cut.data";
import { KerfPositionEnum } from "./cut.enum";
// import { GeometryFactory } from "jsts/geom/GeometryFactory";
// import { Coordinate } from "jsts/geom/Coordinate";
// import { GeometryTypeEnum } from "$lib/geometry/geometry/geometry.enum";
// import { Arc } from "$lib/geometry/arc/arc";
// import { Circle } from "$lib/geometry/circle/circle";
// import { Spline } from "$lib/geometry/spline/spline";
// import { Line } from "$lib/geometry/line/line";
// import { Shape } from "$lib/geometry/shape/shape";
// import { pointCoincident } from "$lib/geometry/point/point.util";
// import { roundToDecimalPlaces } from "$lib/geometry/point/point.util";

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
	// Original shape to cut out before any modifications
	shape: Polyshape;
	leadOut?: Lead;
    // Direction the Path is cut
    orientation: OrientationEnum = OrientationEnum.COUNTERCLOCKWISE;
	// The actual cut path
	_path: Polyshape;

	constructor({ path, leadIn, leadOut, rapidIn }: CutData) {
		super();
		this.shape = new Polyshape(path);
		// Cut path defaults to base shape
		this._path = this.shape.clone();
		if (leadIn)
			this.leadIn = new Lead(leadIn);
		if (leadOut)
			this.leadOut = new Lead(leadOut);
		if (rapidIn)
			this.rapidIn = new Rapid(rapidIn);
	}

	get startPoint(): Point {
		// TODO consider lead in
		return this.path.startPoint;
	}

	get endPoint(): Point {
		// TODO consider lead out
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

	get isClosed(): boolean {
		return this.path.isClosed;
	}

	/** The actual tool cut path */
	get path(): Polyshape {
		return this._path;
	}

    transform(transform: TransformData): void {
		// TODO include Leads
		// const children = [this.leadIn, this.path, this.leadOut];
		const children = [this.shape];
        children.forEach(child => child.transform(transform));
		// TODO also transform this._path? Or just reapply kerf?
    }

	kerf(width: number, position: KerfPositionEnum) {

		// TODO Throw error if shape is self intersecting?
		// Seems impossible to tell what is inside and what is outside.
		// See Polylinie.dxf

		if (position === KerfPositionEnum.NONE) return;

		// Inside offset position must be negative
		if (position === KerfPositionEnum.INSIDE) width = -Math.abs(width);
		// Tool is always centered on the cut path,
		// so offset width is half of kerf width
		width = width / 2;

		// Offset the Polyshape
		const offset: Polyshape = this.shape.clone();
		offset.offset(width);

		// TODO call meet() on each shape
		// for (let i = 0; i < offset.shapes.length - 1; i++) {
		// 	console.log(offset.shapes[i]);
		// 	offset.shapes[i].meet(offset.shapes[i + 1]);
		// }
				
		this._path = offset;
	}

}
