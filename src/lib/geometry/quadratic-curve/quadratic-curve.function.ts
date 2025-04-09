import type { PointData } from "../point/point.data";
import type { QuadraticCurveData } from "./quadratic-curve.data";
import type { BoundaryData } from "../boundary/boundary.data";
import { pointCoincident } from "../point/point.function";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

// Downsample a QuadraticCurve into an array of points
export function quadraticCurveSample(
	curve: QuadraticCurveData,
	samples: number = 20
): PointData[] {
	const points: PointData[] = [];
	for (let i = 0; i <= samples; i++) {
		const t = i / samples;
		let point;
		// Quadratic Bezier Curve: P = (1 - t)^2 * P0 + 2(1 - t)t * P1 + t^2 * P2
		const p0 = curve.startPoint;
		const p1 = curve.controlPoint;
		const p2 = curve.endPoint;
		point = {
			x: Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x,
			y: Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y
		};
		points.push(point);
	}
	return points;
}

/** Check if a quadratic curve is closed (start point equals end point) */
export function quadraticCurveIsClosed(curve: QuadraticCurveData, tolerance: number = 0.005): boolean {
	return pointCoincident(curve.startPoint, curve.endPoint, tolerance);
}

/** Calculate a bounding box for a quadratic curve */
export function quadraticCurveBoundary(curve: QuadraticCurveData): BoundaryData {
	// Get points along the curve
	const points = quadraticCurveSample(curve);

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

/** Apply transform to a quadratic curve */
export function quadraticCurveTransform(transform: TransformData, curve: QuadraticCurveData): QuadraticCurveData {
	// Create transformation matrix
	const matrix = compose(
		translate(transform.translateX || 0, transform.translateY || 0),
		rotate(transform.rotateAngle || 0),
		scale(transform.scaleX || 1, transform.scaleY || 1)
	);

	// Transform all points
	const startPoint = applyToPoint(matrix, curve.startPoint);
	const controlPoint = applyToPoint(matrix, curve.controlPoint);
	const endPoint = applyToPoint(matrix, curve.endPoint);

	return {
		startPoint,
		controlPoint,
		endPoint
	};
}
