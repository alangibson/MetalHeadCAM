import type { Spline } from "$lib/geometry/spline/spline";
import { splineSample } from "$lib/geometry/spline/spline.function";

/**
 * Convert a spline to SVG path commands using sampled points
 */
export function splineSvgPathCommand(spline: Spline): string {
    let pathData = "";
    if (spline.controlPoints.length < 2) {
        return '';
    } else if (spline.controlPoints.length == 3) {
        // TODO quadratic curve
        const [p0, p1, p2] = spline.controlPoints;
        pathData += `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y}, ${p2.x} ${p2.y} `;
    } else if (spline.controlPoints.length == 4) {
        // Cubic curve
        const [p0, p1, p2, p3] = spline.controlPoints;
        // Convert to SVG path data format
        pathData += `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y} `;
    } else {
        // Treat it as a NURBS
        // TODO Should we Spline.decompose() and then render as bezier curves instead?
        const points = splineSample(spline, 1000);
        // Skip first point since it's handled by parent PolyshapeShape
        let pathData = '';
        for (let i = 1; i < points.length; i++) {
            pathData += ` L ${points[i].x} ${points[i].y}`;
        }
    }
    return pathData;
}
