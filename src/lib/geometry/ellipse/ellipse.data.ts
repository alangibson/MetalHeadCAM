import type { PointData } from "../point/point.data";

export interface EllipseData {
    origin: PointData;
    majorLength: number;
    minorLength: number;
    rotation: number;    // angle in radians from positive x-axis
    startAngle: number;  // start angle in radians
    endAngle: number;    // end angle in radians
}