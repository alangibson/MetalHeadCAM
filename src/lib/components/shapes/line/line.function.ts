import type { Line } from "$lib/geometry/line/line";

export function lineSvgPathCommand(shape: Line): string {
    return ` L ${shape.endPoint.x} ${shape.endPoint.y}`
}