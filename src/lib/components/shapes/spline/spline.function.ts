import type { Spline } from "$lib/geometry/spline/spline";
import { splineSample } from "$lib/geometry/spline/spline.function";

/**
 * Convert a spline to SVG path commands using sampled points
 */
export function splineSvgPathCommand(spline: Spline): string {
    const points = splineSample(spline, 1000);
    
    if (points.length < 2) {
        return '';
    }

    // Skip first point since it's handled by parent PolyshapeShape
    let pathData = '';
    for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`;
    }

    return pathData;
}
