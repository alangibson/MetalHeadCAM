import type { Shape } from "./shape";

/**
 * Returns true if shapes start or end points are connected at some point.
 */
export function shapeIsConnected(thisShape: Shape, thatShape: Shape, tolerance: number = 0.05) {
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
export function shapeChains(shapes: Shape[], tolerance: number = 0.01): Shape[][] {
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
