import type { AngleDegrees, AngleRadians } from "./angle.type";
import type { PointData } from "../point/point.data";

/**
 * Convert degrees to radians.
 *
 * @param degrees - The angle in degrees to convert
 * @returns The angle in radians
 */
export function degreesToRadians(degrees: AngleDegrees): AngleRadians {
    return degrees * (Math.PI / 180);
}
/**
 * Convert radians to degrees.
 *
 * @param radians - The angle in radians to convert
 * @returns The angle in degrees
 */

export function radiansToDegrees(radians: AngleRadians): AngleDegrees {
    return radians * (180 / Math.PI);
}
/**
 * Normalize angle to be between 0 and 2π
 */

export function normalizeAngle(angle: AngleRadians): AngleRadians {
    const TWO_PI = 2 * Math.PI;
    return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}
// In radians

export function rotateAngleNormalized(angle: AngleRadians, rotation: AngleRadians) {
    const TWO_PI = Math.PI * 2;
    return ((angle + rotation) % TWO_PI + TWO_PI) % TWO_PI;
}

/**
 * Calculate the angle between two points in radians.
 * The angle is measured from the positive x-axis to the line connecting the points.
 * 
 * @param a - The first point
 * @param b - The second point
 * @returns The angle in radians between -π and π
 */
export function angleBetweenPoints(a: PointData, b: PointData): AngleRadians {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.atan2(dy, dx);
}
