import type { PointData } from "./point.data";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

/**
 * Point-in-polygon test using ray casting algorithm
 *
 * @param point
 * @param polygon
 * @param edgeEnclosed If true, points on polygon edge are considered enclosed. Otherwise, they are not.
 * @returns
 */
export function pointEnclosedByPolygon(
	point: PointData,
	polygon: PointData[],
	edgeEnclosed: boolean = false
) {
	let crossings = 0;
	for (let i = 0; i < polygon.length - 1; i++) {
		const a = polygon[i];
		const b = polygon[i + 1];

		// Check if point lies exactly on the edge
		const minX = Math.min(a.x, b.x);
		const maxX = Math.max(a.x, b.x);
		const minY = Math.min(a.y, b.y);
		const maxY = Math.max(a.y, b.y);
		const onEdge =
			(b.y - a.y) * (point.x - a.x) - (b.x - a.x) * (point.y - a.y) === 0 &&
			point.x >= minX &&
			point.x <= maxX &&
			point.y >= minY &&
			point.y <= maxY;
		if (!edgeEnclosed && onEdge) {
			return false; // Consider point on the edge as outside
		} else if (edgeEnclosed && onEdge) {
			return true; // Consider point on the edge as inside
		}

		// Ray casting logic
		if (a.y > point.y !== b.y > point.y) {
			const atX = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
			if (point.x < atX) {
				crossings++;
			}
		}
	}
	return crossings % 2 !== 0;
}

export function pointCoincident(thisPoint: PointData, thatPoint: PointData, tolerance: number = 0.005): boolean {
	return Math.abs(thisPoint.x - thatPoint.x) < tolerance && Math.abs(thisPoint.y - thatPoint.y) < tolerance;
}

/** Apply transform to a point */
export function pointTransform(transform: TransformData, point: PointData): PointData {
	// Create transformation matrix
	const matrix = compose(
		translate(transform.translateX || 0, transform.translateY || 0),
		rotate(transform.rotateAngle || 0),
		scale(transform.scaleX || 1, transform.scaleY || 1)
	);

	// Transform point
	return applyToPoint(matrix, point);
}

/** Calculate squared distance between two points */
export function pointDistance(a: PointData, b: PointData): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const distance = dx * dx + dy * dy;
	return distance;
}