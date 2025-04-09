import type { GeometryTypeEnum } from "../geometry/geometry.enum";
import type { PointData } from "../point/point.data";
import type { ArcDirectionEnum } from "./arc.enum";

export interface ArcData {
    origin: PointData;
    radius: number;
    startAngle: number;
    endAngle: number;
    direction?: ArcDirectionEnum;
}