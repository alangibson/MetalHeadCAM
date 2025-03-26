import type { PointData } from "../point/point.data";

export interface CubicCurveData {
    startPoint: PointData;
    control1Point: PointData;
    control2Point: PointData;
    endPoint: PointData;
}
