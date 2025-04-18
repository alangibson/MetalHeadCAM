import type { Polyshape } from "$lib/geometry/polyshape/polyshape";
import { polyshapeSample } from "$lib/geometry/polyshape/polyshape.function";
import { shapeSvgPathCommand } from "../shape/shape.function";

/**
 * Convert a polyshape to SVG path commands using sampled points
 */
export function polyshapeSvgPathCommand(polyshape: Polyshape): string {
    let pathData: string = '';
    for (const shape of polyshape.shapes) {
        pathData += shapeSvgPathCommand(shape);
    }
    return pathData;
}

