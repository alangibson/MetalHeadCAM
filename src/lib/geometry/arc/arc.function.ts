import type { PointData } from "../point/point.data";
import { rotateAngleNormalized } from "../shape/shape.function";
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
    const newOrigin = applyToPoint(matrix, arc.origin);
    const origin: PointData = {
        x: newOrigin.x,
        y: newOrigin.y
    };

    // Scale radius (use average of X and Y scale since circle should stay circular)
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

/**
 * Normalize angle to be between 0 and 2π
 */
function normalizeAngle(angle: number): number {
    const TWO_PI = 2 * Math.PI;
    return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}
