import { Arc } from "$lib/geometry/arc/arc";
import { Circle } from "$lib/geometry/circle/circle";
import type { Geometry } from "$lib/geometry/geometry/geometry";
import { Line } from "$lib/geometry/line/line";
import { Polyshape } from "$lib/geometry/polyshape/polyshape";
import type { Shape } from "$lib/geometry/shape/shape";
import { Spline } from "$lib/geometry/spline/spline";
import { arcSvgPathCommand } from "../arc/arc.function";
import { circleSvgPathCommand } from "../circle/circle.function";
import { lineSvgPathCommand } from "../line/line.function";
import { polyshapeSvgPathCommand } from "../polyshape/polyshape.function";
import { splineSvgPathCommand } from "../spline/spline.function";

export function shapeSvgPathCommand(shape: Shape): string {
    if (shape instanceof Line) {
        return lineSvgPathCommand(shape);
    } else if (shape instanceof Arc) {
        return arcSvgPathCommand(shape);
    } else if (shape instanceof Circle) {
        return circleSvgPathCommand(shape);
    } else if (shape instanceof Spline) {
        return splineSvgPathCommand(shape);
    } else if (shape instanceof Polyshape) {
        return polyshapeSvgPathCommand(shape);
    } else {
        console.warn("Don't know how to make SVG path for", shape);
        return '';
    }
}