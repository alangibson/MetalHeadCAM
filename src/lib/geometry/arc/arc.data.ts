import type { OrientationEnum } from "../geometry/geometry.enum";
import type { PointData } from "../point/point.data";

export interface ArcData {
    origin: PointData;
    radius: number;
    startAngle: number;
    endAngle: number;
    orientation?: OrientationEnum;
}