import type { AngleRadians } from "../angle/angle.type";
import type { Boundary } from "../boundary/boundary";
import { Geometry } from "../geometry/geometry";
import type { OrientationEnum } from "../geometry/geometry.enum";
import type { Point } from "../point/point";
import type { PointData } from "../point/point.data";

export enum AxisEnum {
    HORIZONTAL = 0,
    VERTICAL = 1
}

/** A 2 dimensional shape */
export abstract class Shape extends Geometry {
    abstract startPoint: Point;
    abstract endPoint: Point;
    abstract isClosed: boolean;
    abstract boundary: Boundary;
    abstract length: number;
    // Null if isClosed==false
    abstract area: number|null;
    abstract orientation: OrientationEnum;
    abstract contains(geometry: Geometry): boolean;
    // Convert shape to array of points
    abstract tessellate(samples?: number): Point[];
    // Swap start and end points, at a minimum.
	// Implementing classes must also take care of any points in between.
	abstract reverse(): void;
    // Get angle on xy plane of line or tangent of curve at a given point
    abstract bearingAt(point: PointData): AngleRadians;
}
