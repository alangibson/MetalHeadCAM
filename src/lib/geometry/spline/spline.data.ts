import type { PointData } from "../point/point.data";

export interface SplineData {
    controlPoints: PointData[];
    knots?: number[];
    weights?: number[];
    degree?: number;
}