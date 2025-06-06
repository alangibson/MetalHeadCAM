import type { Arc } from "$lib/geometry/arc/arc";
import { normalizeAngle } from "$lib/geometry/angle/angle.function";
import { OrientationEnum } from "$lib/geometry/geometry/geometry.enum";

/**
 * Calculate SVG path arc flags for an Arc.
 * 
 * @param startAngle Start angle in radians
 * @param endAngle End angle in radians 
 * @param orientation Arc direction (CW or CCW)
 * @returns [largeArcFlag, sweepFlag] where:
 *   - largeArcFlag: 1 for arc greater than 180 degrees, 0 for less
 *   - sweepFlag: 1 for clockwise, 0 for counterclockwise
 */
export function arcToSvgFlags(startAngle: number, endAngle: number, orientation: OrientationEnum): [number, number] {
    // Normalize angles to 0-2π range
    const normalizedStart = normalizeAngle(startAngle);
    const normalizedEnd = normalizeAngle(endAngle);

    // Calculate angle difference based on direction
    let angleDiff: number;
    if (orientation === OrientationEnum.COUNTERCLOCKWISE) {
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

    const sweepFlag = orientation === OrientationEnum.CLOCKWISE ? 0 : 1;

    return [largeArcFlag, sweepFlag];
}

export function arcSvgPathCommand(shape: Arc): string {
    const rx = shape.radius;
    const ry = shape.radius;
    const xAxisRotation = 0;
    let [largeArcFlag, sweepFlag] = arcToSvgFlags(
        shape.startAngle,
        shape.endAngle,
        shape.orientation
    );
    return ` A ${rx} ${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${shape.endPoint.x} ${shape.endPoint.y}`;
}