import type { QuadraticCurve } from "$lib/geometry/quadratic-curve/quadratic-curve";

/**
 * Convert a quadratic curve to SVG path commands
 */
export function quadraticCurveSvgPathCommand(curve: QuadraticCurve): string {
    // Q command: Q controlX controlY endX endY
    return ` Q ${curve.controlPoint.x} ${curve.controlPoint.y} ${curve.endPoint.x} ${curve.endPoint.y}`;
} 