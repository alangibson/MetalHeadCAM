import type { PointData } from "../point/point.data";
import type { SplineData } from "./spline.data";
import type { BoundaryData } from "../boundary/boundary.data";
import { pointCoincident } from "../point/point.function";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

/** Check if a spline is closed (start point equals end point) */
export function splineIsClosed(spline: SplineData, tolerance: number = 0.005): boolean {
    if (spline.controlPoints.length < 2) return false;
    return pointCoincident(
        spline.controlPoints[0], 
        spline.controlPoints[spline.controlPoints.length - 1],
        tolerance
    );
}

/** Calculate a bounding box for a spline */
export function splineBoundary(spline: SplineData, samples: number = 100): BoundaryData {
    // For a NURBS, we'll use the control points to determine the boundary
    // Note: The actual curve may extend outside this boundary
    const points = splineSample(spline, samples);

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

/** Convert spline to array of points */
export function splineSample(
    spline: SplineData,
    samples: number = 100
): PointData[] {
    // For now, we'll just return the control points
    // TODO: Implement proper NURBS evaluation using verb-nurbs or similar library
    return [...spline.controlPoints];
}

/** Apply transform to a spline */
export function splineTransform(transform: TransformData, spline: SplineData): SplineData {
    // Create transformation matrix
    const matrix = compose(
        translate(transform.translateX || 0, transform.translateY || 0),
        rotate(transform.rotateAngle || 0),
        scale(transform.scaleX || 1, transform.scaleY || 1)
    );

    // Transform all control points
    const controlPoints = spline.controlPoints.map(point => applyToPoint(matrix, point));

    return {
        controlPoints
    };
}

