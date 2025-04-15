
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

export function normalizeAngle(angle: number): number {
    const TWO_PI = 2 * Math.PI;
    return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}
// In radians

export function rotateAngleNormalized(angle: number, rotation: number) {
    const TWO_PI = Math.PI * 2;
    return ((angle + rotation) % TWO_PI + TWO_PI) % TWO_PI;
}
