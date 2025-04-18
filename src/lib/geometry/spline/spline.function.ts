import type { PointData } from "../point/point.data";
import type { SplineData } from "./spline.data";
import type { BoundaryData } from "../boundary/boundary.data";
import { pointCoincident } from "../point/point.function";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';
import nurbs from 'nurbs';
import { OrientationEnum } from "../geometry/geometry.enum";
import { lineOrientation } from "../line/line.function";

/** Check if a spline is closed (start point equals end point) */
export function splineIsClosed(spline: SplineData, tolerance: number = 0.005): boolean {
    if (spline.controlPoints.length < 2) return false;
    return pointCoincident(
        spline.controlPoints[0], 
        spline.controlPoints[spline.controlPoints.length - 1],
        tolerance
    );
}

/** Calculate the signed area of a closed NURBS curve */
export function splineArea(spline: SplineData): number {
    if (!splineIsClosed(spline) || spline.controlPoints.length < 3) {
        return 0;
    }

    let area = 0;
    for (let i = 0; i < spline.controlPoints.length; i++) {
        const current = spline.controlPoints[i];
        const next = spline.controlPoints[(i + 1) % spline.controlPoints.length];
        area += (next.x - current.x) * (next.y + current.y);
    }
    return area;
}

/** Calculate the orientation of a NURBS */
export function splineOrientation(spline: SplineData): OrientationEnum {
    if (spline.controlPoints.length < 2) {
        return OrientationEnum.COLINEAR;
    }

    // If the spline is closed, use the polygon area method
    if (splineIsClosed(spline)) {
        if (spline.controlPoints.length < 3) {
            return OrientationEnum.COLINEAR;
        }

        const area = splineArea(spline);
        if (Math.abs(area) < 0.0001) { // Using a small epsilon for floating point comparison
            return OrientationEnum.COLINEAR;
        }
        return area > 0 ? OrientationEnum.CLOCKWISE : OrientationEnum.COUNTERCLOCKWISE;
    } else {
        // For open splines, determine orientation based on start to end direction
        const start = spline.controlPoints[0];
        const end = spline.controlPoints[spline.controlPoints.length - 1];
        return lineOrientation(start, end);
    }
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

export function splineStartPoint(spline: SplineData): PointData {
    return spline.controlPoints[0];
}

export function splineEndPoint(spline: SplineData): PointData {
    return spline.controlPoints[spline.controlPoints.length - 1];
}

/**
 * Sample points along a spline curve using Three.js
 */
export function splineSample(spline: SplineData, samples: number = 1000): PointData[] {
    if (spline.controlPoints.length < 2) {
        return [];
    }

    if (samples < 4) {
        console.warn('samples', samples, spline);
    }

    const curve = nurbs({
        points: spline.controlPoints.map(p => [p.x, p.y]),
        boundary: 'clamped'
    });

    // Sample points along the curve
    const sampledPoints: PointData[] = [splineStartPoint(spline)];
    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const point = curve.evaluate([], t);
        sampledPoints.push({ x: point[0], y: point[1] });
    }
    sampledPoints.push(splineEndPoint(spline));
    return sampledPoints;
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

/**
 * Calculate middle point of spline curve.
 * Uses t = 0.5 to find point halfway along curve.
 */
export function splineMiddlePoint(spline: SplineData): PointData {
    // Sample points and get the middle one
    const points = splineSample(spline, 30);
    
    if (points.length < 2) {
        // Return first control point if not enough points
        return spline.controlPoints[0];
    }

    // Get middle point (round down for even number of points)
    const midIndex = Math.floor((points.length - 1) / 2);
    return points[midIndex];
}

