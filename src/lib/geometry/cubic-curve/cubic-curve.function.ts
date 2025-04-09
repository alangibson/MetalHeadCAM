import type { PointData } from "../point/point.data";
import type { CubicCurveData } from "./cubic-curve.data";
import type { BoundaryData } from "../boundary/boundary.data";
import { pointCoincident } from "../point/point.function";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

// Downsample a CubicCurve into an array of points
export function cubicCurveSample(
	curve: CubicCurveData,
	samples: number = 20
): PointData[] {
	const points: PointData[] = [];
	for (let i = 0; i <= samples; i++) {
		const t = i / samples;
		let point;
		// Cubic Bezier Curve
		const p0 = curve.startPoint;
		const p1 = curve.control1Point;
		const p2 = curve.control2Point;
		const p3 = curve.endPoint;
		point = {
			x:
				Math.pow(1 - t, 3) * p0.x +
				3 * Math.pow(1 - t, 2) * t * p1.x +
				3 * (1 - t) * Math.pow(t, 2) * p2.x +
				Math.pow(t, 3) * p3.x,
			y:
				Math.pow(1 - t, 3) * p0.y +
				3 * Math.pow(1 - t, 2) * t * p1.y +
				3 * (1 - t) * Math.pow(t, 2) * p2.y +
				Math.pow(t, 3) * p3.y
		};
		points.push(point);
	}
	return points;
}

/** Check if a cubic curve is closed (start point equals end point) */
export function cubicCurveIsClosed(curve: CubicCurveData, tolerance: number = 0.005): boolean {
	return pointCoincident(curve.startPoint, curve.endPoint, tolerance);
}

/** Calculate a bounding box for a cubic curve */
export function cubicCurveBoundary(curve: CubicCurveData): BoundaryData {
	// Get points along the curve
	const points = cubicCurveSample(curve);

	// Find min/max x and y values
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;

	points.forEach(point => {
		minX = Math.min(minX, point.x);
		maxX = Math.max(maxX, point.x);
		minY = Math.min(minY, point.y);
		maxY = Math.max(maxY, point.y);
	});

	return {
		startPoint: { x: minX, y: minY },
		endPoint: { x: maxX, y: maxY }
	};
}

/** Apply transform to a cubic curve */
export function cubicCurveTransform(transform: TransformData, curve: CubicCurveData): CubicCurveData {
	// Create transformation matrix
	const matrix = compose(
		translate(transform.translateX || 0, transform.translateY || 0),
		rotate(transform.rotateAngle || 0),
		scale(transform.scaleX || 1, transform.scaleY || 1)
	);

	// Transform all points
	const startPoint = applyToPoint(matrix, curve.startPoint);
	const control1Point = applyToPoint(matrix, curve.control1Point);
	const control2Point = applyToPoint(matrix, curve.control2Point);
	const endPoint = applyToPoint(matrix, curve.endPoint);

	return {
		startPoint,
		control1Point,
		control2Point,
		endPoint
	};
}

// TODO is this one more accurate?
// 
// export function cubicCurveBoundary(
// 	p0: PointData,
// 	p1: PointData,
// 	p2: PointData,
// 	p3: PointData
// ) {
// 	// The bezier(t) function computes the point on the
// 	// curve for a given parameter t (from 0 to 1).
// 	function bezier(t) {
// 		const x =
// 			Math.pow(1 - t, 3) * p0.x +
// 			3 * Math.pow(1 - t, 2) * t * p1.x +
// 			3 * (1 - t) * Math.pow(t, 2) * p2.x +
// 			Math.pow(t, 3) * p3.x;
//
// 		const y =
// 			Math.pow(1 - t, 3) * p0.y +
// 			3 * Math.pow(1 - t, 2) * t * p1.y +
// 			3 * (1 - t) * Math.pow(t, 2) * p2.y +
// 			Math.pow(t, 3) * p3.y;
//
// 		return [x, y];
// 	}
//
// 	//  initialize the bounding box coordinates using the control points.
// 	let minX = Math.min(p0.x, p1.x, p2.x, p3.x);
// 	let maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
// 	let minY = Math.min(p0.y, p1.y, p2.y, p3.y);
// 	let maxY = Math.max(p0.y, p1.y, p2.y, p3.y);
//
// 	// By incrementing t in small steps (in this case, 0.01),
// 	// we evaluate points on the curve and update the bounding box accordingly.
// 	for (let t = 0; t <= 1; t += 0.01) {
// 		const point = bezier(t);
// 		minX = Math.min(minX, point[0]);
// 		maxX = Math.max(maxX, point[0]);
// 		minY = Math.min(minY, point[1]);
// 		maxY = Math.max(maxY, point[1]);
// 	}
//
// 	// Return the bounding box as an object
// 	return {
// 		minX: minX,
// 		minY: minY,
// 		maxX: maxX,
// 		maxY: maxY
// 	};
// }