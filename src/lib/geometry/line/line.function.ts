import { OrientationEnum } from "../geometry/geometry.enum";
import type { PointData } from "../point/point.data";
import { pointCoincident } from "../point/point.function";
import type { TransformData } from "../transform/transform.data";
import type { LineData } from "./line.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

// Helper function to calculate orientation of two lines against each other
export function lineMutualOrientation(a: PointData, b: PointData, c: PointData): OrientationEnum {
	const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
	if (val === 0) return OrientationEnum.COLINEAR;
	return val > 0 ? OrientationEnum.CLOCKWISE : OrientationEnum.COUNTERCLOCKWISE;
}

export function lineOrientation(start: PointData, end: PointData): OrientationEnum {
	// const deltaX = end.x - start.x;
	// const deltaY = end.y - start.y;
	// const angle = Math.atan2(deltaY, deltaX); // Angle in radians between -π and π
	// if (angle >= 0) {
	// 	return OrientationEnum.CLOCKWISE;
	// } else {
	// 	return OrientationEnum.COUNTERCLOCKWISE;
	// }

	const deltaX = end.x - start.x;
	const deltaY = end.y - start.y;
	
	if (Math.abs(deltaX) < 0.0001 && Math.abs(deltaY) < 0.0001) {
		return OrientationEnum.COLINEAR;
	}
	
	const angle = Math.atan2(deltaY, deltaX);
	return angle >= 0 ? OrientationEnum.CLOCKWISE : OrientationEnum.COUNTERCLOCKWISE;

}

// Helper function to check if point q lies on segment pr
export function pointIsOnLine(p: PointData, q: PointData, r: PointData) {
	return (
		q.x <= Math.max(p.x, r.x) &&
		q.x >= Math.min(p.x, r.x) &&
		q.y <= Math.max(p.y, r.y) &&
		q.y >= Math.min(p.y, r.y)
	);
}

// Function to check if two line segments intersect
export function lineIntersects(
	p1: PointData,
	p2: PointData,
	p3: PointData,
	p4: PointData
) {
	const o1 = lineOrientation(p1, p2, p3);
	const o2 = lineOrientation(p1, p2, p4);
	const o3 = lineOrientation(p3, p4, p1);
	const o4 = lineOrientation(p3, p4, p2);

	// General case
	if (o1 !== o2 && o3 !== o4) {
		return true;
	}

	// Special Cases
	if (o1 === 0 && pointIsOnLine(p1, p3, p2)) return true; // p3 lies on p1p2
	if (o2 === 0 && pointIsOnLine(p1, p4, p2)) return true; // p4 lies on p1p2
	if (o3 === 0 && pointIsOnLine(p3, p1, p4)) return true; // p1 lies on p3p4
	if (o4 === 0 && pointIsOnLine(p3, p2, p4)) return true; // p2 lies on p3p4

	return false;
}

/** Apply transform to a line */
export function lineTransform(transform: TransformData, line: LineData): LineData {
	// Create transformation matrix
	const matrix = compose(
		translate(transform.translateX || 0, transform.translateY || 0),
		rotate(transform.rotateAngle || 0),
		scale(transform.scaleX || 1, transform.scaleY || 1)
	);

	// Transform all points
	const startPoint = applyToPoint(matrix, line.startPoint);
	const endPoint = applyToPoint(matrix, line.endPoint);

	return {
		startPoint,
		endPoint
	};
}

export function lineMiddlePoint(line: LineData): PointData {
	// Calculate the midpoint coordinates
	const midX = (line.startPoint.x + line.endPoint.x) / 2;
	const midY = (line.startPoint.y + line.endPoint.y) / 2;
	// Return the midpoint as an object
	return { x: midX, y: midY };
}

/**
 * Sample points along a line at regular intervals
 */
export function lineTessellate(line: LineData, samples: number = 1000): PointData[] {
	// Lines with where start and end point are the same have been seen in the wild
	if (pointCoincident(line.startPoint, line.endPoint))
		return [];

	const points: PointData[] = [];
	for (let i = 0; i <= samples; i++) {
		const t = i / samples;
		const point = {
			x: line.startPoint.x + t * (line.endPoint.x - line.startPoint.x),
			y: line.startPoint.y + t * (line.endPoint.y - line.startPoint.y)
		};
		points.push(point);
	}
	return points;
}

/** 
 * The idea of a closed line is nonsensical, but in practice we sometimes find
 * lines where start and end point are the same, or nearly the same.
 */
export function lineIsClosed(line: LineData): boolean {
	return pointCoincident(line.startPoint, line.endPoint);
}