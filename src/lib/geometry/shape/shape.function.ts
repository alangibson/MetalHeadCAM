import type { Shape } from "./shape";
import type { Point } from "./point";
import { DEFAULT_COINCIDENCE_TOLERANCE } from "$lib/domain/importing/config/defaults";

/**
 * Returns true if shapes start or end points are connected at some point.
 */
export function shapeIsConnected(thisShape: Shape, thatShape: Shape, tolerance: number = DEFAULT_COINCIDENCE_TOLERANCE) {
	return (
		thisShape.endPoint.coincident(thatShape.startPoint, tolerance) ||
		thisShape.endPoint.coincident(thatShape.endPoint, tolerance) ||
		thisShape.startPoint.coincident(thatShape.startPoint, tolerance) ||
		thisShape.startPoint.coincident(thatShape.endPoint, tolerance)
	);
}

/**
 * Connects all points in shapes within given tolerance. 
 * Returns an array of chains of Shapes.
 */
export function shapeChains(shapes: Shape[], tolerance: number = DEFAULT_COINCIDENCE_TOLERANCE): Shape[][] {
	const chains: Shape[][] = [];
	const visited = new Array(shapes.length).fill(false);

	// Depth-first search function
	function dfs(index: number, group: Shape[]) {
		visited[index] = true;
		group.push(shapes[index]);

		for (let i = 0; i < shapes.length; i++) {
			if (!visited[i] && shapeIsConnected(shapes[index], shapes[i], tolerance)) {
				dfs(i, group);
			}
		}
	}

	for (let i = 0; i < shapes.length; i++) {
		if (!visited[i]) {
			const group: Shape[] = [];
			dfs(i, group);
			chains.push(group);
		}
	}

	return chains;
}

/**
 * Calculate area of a closed shape using the shoelace formula.
 * Returns null if shape is not closed.
 */
export function shapeAreaFromPoints(points: Point[]): number | null {
    // Must be closed shape
    if (!points[0].coincident(points[points.length - 1])) {
        return null;
    }

    let area = 0;
    for (let i = 0; i < points.length - 1; i++) {
        area += points[i].x * points[i + 1].y;
        area -= points[i + 1].x * points[i].y;
    }

    return Math.abs(area) / 2;
}

/**
 * Calculate approximate length of a curve by sampling points and summing distances
 */
export function shapeLengthFromPoints(points: Point[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
}
