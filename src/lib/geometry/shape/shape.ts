import type { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import type { PointData } from "../point/point.data";

export enum AxisEnum {
    HORIZONTAL = 0,
    VERTICAL = 1
}

/** A 2 dimensional shape */
export interface Shape extends Geometry {
    startPoint: PointData;
    endPoint: PointData;
}
