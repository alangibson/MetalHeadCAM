import type { PointData } from '../point/point.data';
import type { TransformData } from '../transform/transform.data';
import type { EllipseData } from './ellipse.data';
import type { BoundaryData } from "../boundary/boundary.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';
import { rotateAngleNormalized } from "../angle/angle.function";

/** Get point on ellipse at given angle */
export function ellipsePointAtAngle(
    ellipse: EllipseData,
    angle: number
): PointData {
    // Get point on unrotated ellipse
    const x = ellipse.majorLength * Math.cos(angle);
    const y = ellipse.minorLength * Math.sin(angle);

    // Rotate point by ellipse rotation
    const rotatedX = x * Math.cos(ellipse.rotation) - y * Math.sin(ellipse.rotation);
    const rotatedY = x * Math.sin(ellipse.rotation) + y * Math.cos(ellipse.rotation);

    // Translate to ellipse origin
    return {
        x: ellipse.origin.x + rotatedX,
        y: ellipse.origin.y + rotatedY
    };
}

export function ellipseTransform(transform: TransformData, ellipse: EllipseData): EllipseData {
    // Create transformation matrix
    const matrix = compose(
        translate(transform.translateX || 0, transform.translateY || 0),
        rotate(transform.rotateAngle || 0),
        scale(transform.scaleX || 1, transform.scaleY || 1)
    );
    
    // Transform origin point
    const newOrigin = applyToPoint(matrix, ellipse.origin);
    const origin = { x: newOrigin.x, y: newOrigin.y };

    // Scale major and minor lengths
    const majorLength = ellipse.majorLength * (transform.scaleX || 1);
    const minorLength = ellipse.minorLength * (transform.scaleY || 1);

    // Add rotation
    const rotation = rotateAngleNormalized(transform.rotateAngle || 0, ellipse.rotation)

    // TODO update startAngle and endAngle?
    return {
        origin,
        rotation,
        majorLength,
        minorLength,
        startAngle: ellipse.startAngle,
        endAngle: ellipse.endAngle
    };
}

/** Check if an ellipse is closed (forms a complete ellipse) */
export function ellipseIsClosed(startAngle: number, endAngle: number): boolean {
    return Math.abs(endAngle - startAngle) >= 2 * Math.PI;
}

/** Calculate a bounding box for an ellipse */
export function ellipseBoundary(ellipse: EllipseData): BoundaryData {
    // For a rotated ellipse, we need to:
    // 1. Get points along the ellipse
    // 2. Find min/max x and y values
    const points = [];
    const segments = 36; // More segments for better accuracy

    for (let i = 0; i <= segments; i++) {
        const angle = ellipse.startAngle + (i / segments) * (ellipse.endAngle - ellipse.startAngle);
        points.push(ellipsePointAtAngle(ellipse, angle));
    }

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

/** Convert ellipse to array of points */
export function ellipseToPoints(
    ellipse: EllipseData,
    samples: number = 1000
): PointData[] {
    const points: PointData[] = [];
    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const angle = ellipse.startAngle + t * (ellipse.endAngle - ellipse.startAngle);
        points.push(ellipsePointAtAngle(ellipse, angle));
    }
    return points;
}

/**
 * Returns the middle point along an ellipse.
 * Uses angle averaging to find a point between start and end angles.
 */
export function ellipseMiddlePoint(ellipse: EllipseData): PointData {
    // Calculate the averaged angle
    let midAngle = (ellipse.startAngle + ellipse.endAngle) / 2;

    // Ensure angles are within 0 to 2π
    midAngle = (midAngle + 2 * Math.PI) % (2 * Math.PI);

    // Get point on ellipse at midAngle
    return ellipsePointAtAngle(ellipse, midAngle);
}

