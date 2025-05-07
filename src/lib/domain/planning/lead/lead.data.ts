import type { PointData } from "$lib/geometry/point/point.data";

export interface LeadData {
    type: string;
    length: number;
    endPoint: PointData;
}