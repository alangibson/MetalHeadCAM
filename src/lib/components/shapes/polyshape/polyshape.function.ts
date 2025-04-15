import type { Polyshape } from "$lib/geometry/polyshape/polyshape";
import { polyshapeSample } from "$lib/geometry/polyshape/polyshape.function";

/**
 * Convert a polyshape to SVG path commands using sampled points
 */
export function polyshapeSvgPathCommand(polyshape: Polyshape): string {
    const points = polyshapeSample(polyshape, 1000);
    
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

