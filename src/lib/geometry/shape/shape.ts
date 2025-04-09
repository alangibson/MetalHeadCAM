import type { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import type { Point } from "../point/point";
import type { PointData } from "../point/point.data";

export enum AxisEnum {
    HORIZONTAL = 0,
    VERTICAL = 1
}

/** A 2 dimensional shape */
export interface Shape extends Geometry {
    startPoint: Point;
    endPoint: Point;
    isClosed: boolean;
    boundary: Boundary;
    contains(geometry: Geometry): boolean;
    sample(samples: number): Point[];
    // Swap start and end points, at a minimum.
	// Implementing classes must also take care of any points in between.
	reverse(): void;
}
