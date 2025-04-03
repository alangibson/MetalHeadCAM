import type { PointData } from "../point/point.data";

export interface BoundaryData {
	// Bottom left point
	startPoint: PointData;
	// Top right point
	endPoint: PointData;
}
