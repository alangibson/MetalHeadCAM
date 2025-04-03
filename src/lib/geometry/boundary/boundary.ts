import type { PointData } from "../point/point.data";
import type { BoundaryData } from "./boundary.data";
import { boundaryJoin } from "./boundary.function";

export class Boundary implements BoundaryData {
    
    startPoint: PointData;
    endPoint: PointData;

    constructor(data: BoundaryData) {
        this.startPoint = data.startPoint;
        this.endPoint = data.endPoint;
    }

    join(boundary: Boundary): Boundary {
		const newBoundary = boundaryJoin(this, boundary);
		this.startPoint.x = newBoundary.startPoint.x;
		this.startPoint.y = newBoundary.startPoint.y;
		this.endPoint.x = newBoundary.endPoint.x;
		this.endPoint.y = newBoundary.endPoint.y;
		return this;
	}

}