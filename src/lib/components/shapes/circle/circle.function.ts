import type { Circle } from "$lib/geometry/circle/circle";

export function circleSvgPathCommand(shape: Circle): string {
    let pathData = '';
    // Draw circle using SVG path commands
    // Move to start point (center + radius on x-axis)
    const startX = shape.origin.x + shape.radius;
    const startY = shape.origin.y;
    pathData += ` M ${startX} ${startY}`;
    // Draw circle using two arcs
    // First arc: 180 degrees
    pathData += ` A ${shape.radius} ${shape.radius} 0 1 1 ${shape.origin.x - shape.radius} ${shape.origin.y}`;
    // Second arc: remaining 180 degrees
    pathData += ` A ${shape.radius} ${shape.radius} 0 1 1 ${startX} ${startY}`;
    return pathData;
}
