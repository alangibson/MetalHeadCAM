import type { BoundaryData } from "../boundary/boundary.data";
import type { PointData } from "../point/point.data";
import type { TransformData } from "../transform/transform.data";
import type { ArcData } from "./arc.data";
import { ArcDirectionEnum } from "./arc.enum";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

/**
 * Convert degrees to radians.
 * 
 * @param degrees - The angle in degrees to convert
 * @returns The angle in radians
 */
export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 * 
 * @param radians - The angle in radians to convert
 * @returns The angle in degrees
 */
export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Normalize angle to be between 0 and 2π
 */
function normalizeAngle(angle: number): number {
    const TWO_PI = 2 * Math.PI;
    return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

// In radians
export function rotateAngleNormalized(angle: number, rotation: number) {
    const TWO_PI = Math.PI * 2;
    return ((angle + rotation) % TWO_PI + TWO_PI) % TWO_PI
}


/**
 * Calculate the clockwise or counterclockwise sweep of an arc between two angles.
 * 
 * In DXF, and in math generally, sweep direction is CCW by default.
 * If the start angle is less than the end angle, the arc will naturally move
 * counterclockwise from the start to the end.
 * If the start angle is greater than the end angle, the arc still moves
 * counterclockwise but passes through the 0-degree point.
 * 
 * Note: this does not correctly handle zero-crossing angles
 */
export function arcDirection(startAngle: number, endAngle: number): ArcDirectionEnum {
    // FIXME Still wrong for some arcs.
    // See test file "Tractor Light Mount - Left.dxf"

    // Calculate angle difference before normalizing
    let angleDiff = endAngle - startAngle;

    // If angle difference is positive, arc direction is CCW
    // If angle difference is negative, arc direction is CW
    return angleDiff >= 0 ? ArcDirectionEnum.CCW : ArcDirectionEnum.CW;
}

export function arcTransform(transform: TransformData, arc: ArcData): ArcData {
    // Create transformation matrix
    const matrix = compose(
        translate(transform.translateX || 0, transform.translateY || 0),
        rotate(transform.rotateAngle || 0),
        scale(transform.scaleX || 1, transform.scaleY || 1)
    );

    // Transform origin point
    const newOrigin: PointData = applyToPoint(matrix, arc.origin);
    const origin: PointData = {
        x: newOrigin.x,
        y: newOrigin.y
    };

    // Scale radius
    const scaleX = transform.scaleX || 1;
    const radius = arc.radius * scaleX;

    // Add rotation to angles
    const rotation = transform.rotateAngle || 0;

    // Rotate and normalize angles to [0, 2π]
    const startAngle = rotateAngleNormalized(arc.startAngle, rotation);
    const endAngle = rotateAngleNormalized(arc.endAngle, rotation);

    return {
        origin,
        radius,
        startAngle,
        endAngle
    };
}

/**
 * Calculate SVG path arc flags for an Arc.
 * 
 * @param startAngle Start angle in radians
 * @param endAngle End angle in radians 
 * @param direction Arc direction (CW or CCW)
 * @returns [largeArcFlag, sweepFlag] where:
 *   - largeArcFlag: 1 for arc greater than 180 degrees, 0 for less
 *   - sweepFlag: 1 for clockwise, 0 for counterclockwise
 */
export function arcToSvgFlags(startAngle: number, endAngle: number, direction: ArcDirectionEnum): [number, number] {
    // Normalize angles to 0-2π range
    const normalizedStart = normalizeAngle(startAngle);
    const normalizedEnd = normalizeAngle(endAngle);

    // Calculate angle difference based on direction
    let angleDiff: number;
    if (direction === ArcDirectionEnum.CCW) {
        angleDiff = normalizedEnd >= normalizedStart
            ? normalizedEnd - normalizedStart
            : (normalizedEnd + 2 * Math.PI) - normalizedStart;
    } else {
        angleDiff = normalizedStart >= normalizedEnd
            ? normalizedStart - normalizedEnd
            : (normalizedStart + 2 * Math.PI) - normalizedEnd;
    }

    // Large arc flag is 1 if arc is greater than 180 degrees
    const largeArcFlag = angleDiff > Math.PI ? 1 : 0;
    // How dxf lib does it
    // largeArcFlag = normalizedEnd - normalizedStart < Math.PI ? 0 : 1

    const sweepFlag = direction === ArcDirectionEnum.CW ? 0 : 1;

    return [largeArcFlag, sweepFlag];
}

// Downsample an Arc into an array of points
export function arcSample(curve: ArcData, samples: number = 20): PointData[] {
    const points: PointData[] = [];
    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        // Arc approximation using circle parameterization
        const theta = curve.startAngle + t * (curve.endAngle - curve.startAngle);
        let point: PointData = {
            x: curve.origin.x + curve.radius * Math.cos(theta),
            y: curve.origin.y + curve.radius * Math.sin(theta)
        };
        points.push(point);
    }
    return points;
}

// Calculate the coordinates of a point on the arc at a specific angle
export function pointAtAngle(cx: number, cy: number, radius: number, angle: number) {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
    };
}

/** Calculate a bounding box for an arc */
export function arcBoundary(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): BoundaryData {
    // Convert start and end angles to radians
    let start = degreesToRadians(startAngle);
    let end = degreesToRadians(endAngle);

    // Normalize angles so that start is always less than or equal to end
    if (end < start) {
        [start, end] = [end, start];
    }

    // Initial bounding box: starting and ending points of the arc
    let startPoint = pointAtAngle(cx, cy, radius, start);
    let endPoint = pointAtAngle(cx, cy, radius, end);

    let minX = Math.min(startPoint.x, endPoint.x);
    let maxX = Math.max(startPoint.x, endPoint.x);
    let minY = Math.min(startPoint.y, endPoint.y);
    let maxY = Math.max(startPoint.y, endPoint.y);

    // Check for extreme points where the arc crosses the x and y axes
    // The critical angles where the extreme points occur are 0, 90, 180, and 270 degrees (in radians)
    const criticalAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    criticalAngles.forEach((angle) => {
        // Check if the critical angle lies within the arc's angular range
        if (angle >= start && angle <= end) {
            let extremePoint = pointAtAngle(cx, cy, radius, angle);

            minX = Math.min(minX, extremePoint.x);
            maxX = Math.max(maxX, extremePoint.x);
            minY = Math.min(minY, extremePoint.y);
            maxY = Math.max(maxY, extremePoint.y);
        }
    });

    // Return the bounding box as an object with the min/max coordinates
    return {
        startPoint: { x: minX, y: minY },
        endPoint: { x: maxX, y: maxY }
    };
}

// An arc is closed if it forms a complete circle
export function arcIsClosed(arc: ArcData) {
    return Math.abs(arc.endAngle - arc.startAngle) >= 2 * Math.PI;
}