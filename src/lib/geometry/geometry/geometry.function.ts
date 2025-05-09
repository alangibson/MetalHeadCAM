import type { AngleRadians } from "../angle/angle.type";
import type { PointData } from "../point/point.data";

/**
 * Find the intersection point of two tangents expressed in radians
 * @param origin1 First tangent origin point
 * @param angle1 First tangent angle in radians
 * @param origin2 Second tangent origin point
 * @param angle2 Second tangent angle in radians
 * @returns Point of intersection or null if lines are parallel
 */
export function tangentIntersection(
    origin1: PointData,
    angle1: AngleRadians,
    origin2: PointData,
    angle2: AngleRadians
): PointData | null {
    // Convert angles to slopes
    const slope1 = Math.tan(angle1);
    const slope2 = Math.tan(angle2);

    // Check if lines are parallel
    if (Math.abs(slope1 - slope2) < 1e-10) {
        return null;
    }

    // Calculate intersection point using line equations
    // y = mx + b where b = y - mx
    const b1 = origin1.y - slope1 * origin1.x;
    const b2 = origin2.y - slope2 * origin2.x;

    // Solve for x: mx + b = mx + b
    const x = (b2 - b1) / (slope1 - slope2);
    const y = slope1 * x + b1;

    return { x, y };
}