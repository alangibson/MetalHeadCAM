import { Polyshape } from "$lib/geometry/polyshape/polyshape";
import type { Shape } from "$lib/geometry/shape/shape";
import { Cut } from "../cut/cut";
import { cutNesting, type CutNestingNode } from "../cut/cut.function";
import { Part } from "../part/part";

export function reorientShapes(shapes: Shape[], tolerance: number = 0.05) {

    // TODO Blindly calling reverse() on a polyshape does not guarantee that shapes will be 
    // oriented in the same direction

	for (let i = 1; i < shapes.length; i++) {
		const prevShape: Shape = shapes[i - 1];
		const currentShape: Shape = shapes[i];
		if (prevShape.endPoint.coincident(currentShape.startPoint, tolerance)) {
			// Already correctly oriented
			continue;
		} else if (prevShape.endPoint.coincident(currentShape.endPoint, tolerance)) {
			// Reverse the current segment to match the end to start
			currentShape.reverse();
		} else if (prevShape.startPoint.coincident(currentShape.startPoint, tolerance)) {
			// Reverse the previous segment to match the start to end
			prevShape.reverse();
		} else if (prevShape.startPoint.coincident(currentShape.endPoint, tolerance)) {
			currentShape.reverse();
			prevShape.reverse();
		}
	}
}

/**
 * Join chains of shapes into as few continuous Polyshapes as possible.
 */
export function geometriesToPolyshapes(shapeChains: Shape[][]): Polyshape[] {
    // Connect all shapes end-to-start within given tolerance
    const polyshapes: Polyshape[] = [];
    for (let shapeChain of shapeChains) {
        const shapes: Shape[] = [];
        for (let shape of shapeChain) {
            shapes.push(shape);
        }
        polyshapes.push(new Polyshape({shapes}));
    }
    return polyshapes;
}

/**
 * Group one or more Cut(s) it one or more Part(s).
 * This is many-to-many since groupings are unpredictable.
 */
export function cutsRootsToParts(roots: CutNestingNode[]): Part[] {
    // Create nodes for each polygon with properties for parent and children
    // interface Node {
    //     cut: Cut;
    //     parent: Node | null;
    //     children: Node[];
    // }

    // TODO Sort cuts by area in descending order - larger cuts are more likely to contain others
    // const sortedCuts = [...cuts].sort((a, b) => b.cut.path.area - a.cut.path.area);

    // Build heirarchy of parent-child containment relationships
    // let nodes: Node[] = cuts.map((cut: Cut) => ({ cut: cut, parent: null, children: [] }));
    // // Assign parent to each node based on containment
    // for (let i = 0; i < nodes.length; i++) {
    //     let nodeP = nodes[i];
    //     if (nodeP.parent)
    //         // Already has a parent
    //         continue;
    //     for (let j = 0; j < nodes.length; j++) {
    //         if (i === j) continue;
    //         let nodeQ = nodes[j];
    //         if (nodeQ.cut.path.contains(nodeP.cut.path)) {
    //             nodeP.parent = nodeQ;
    //         }
    //     }
    // }
    // // Build children arrays for each node
    // for (let node of nodes) {
    //     if (node.parent) {
    //         node.parent.children.push(node);
    //     }
    // }
    // Find all outermost polygons (roots of containment trees)
    // let roots = nodes.filter((node) => node.parent === null);

    // const roots: CutNestingNode[] = cutNesting(cuts);

    // Recursive function to process into Parts
    let parts: Part[] = [];
    function processNode(node: CutNestingNode) {
        let holes: Cut[] = node.children.map((child) => child.cut);
        if (node.parent === null)
            parts.push(new Part({ shell: node.cut, holes: holes }));
        // Process children recursively
        for (let child of node.children) {
            processNode(child);
        }
    }
    // Process each root node
    for (let root of roots) {
        processNode(root);
    }

    return parts;
}
