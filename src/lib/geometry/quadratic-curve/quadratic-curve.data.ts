import type { PointData } from "../point/point.data";

export interface QuadraticCurveData {
    startPoint: PointData;
    controlPoint: PointData;
    endPoint: PointData;
}