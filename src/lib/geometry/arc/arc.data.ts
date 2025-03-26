import type { PointData } from "../point/point.data";

export interface ArcData {
    origin: PointData;
    radius: number;
    startAngle: number;
    endAngle: number;
}