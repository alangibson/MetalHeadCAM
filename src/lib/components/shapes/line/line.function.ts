import type { Line } from "$lib/geometry/line/line";

export function lineSvgPathCommand(shape: Line): string {
    return `M ${shape.startPoint.x} ${shape.startPoint.y} L ${shape.endPoint.x} ${shape.endPoint.y}`
}