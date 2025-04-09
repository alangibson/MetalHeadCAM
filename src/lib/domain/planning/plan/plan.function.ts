import type { Layer } from "$lib/domain/drawing/layer/layer";
import type { Geometry } from "$lib/geometry/geometry/geometry";
import type { PointData } from "$lib/geometry/point/point.data";
import { Polyshape } from "$lib/geometry/polyshape/polyshape";
import { polyshapeContains } from "$lib/geometry/polyshape/polyshape.function";
import type { Shape } from "$lib/geometry/shape/shape";
import { shapeChains } from "$lib/geometry/shape/shape.function";
import { Cut } from "../cut/cut";
import { Part } from "../part/part";

/**
 * Join chains of shapes into as few continuous Polyshapes as possible.
 */
export function geometriesToPolyshapes(shapeChains: Shape[][]): Polyshape[] {
    // Connect all shapes end-to-start within given tolerance
    const polyshapes: Polyshape[] = [];
    for (let shapeChain of shapeChains) {
        // TODO ? reorientShapes(graph, config.tolerance);
        const shapes: Shape[] = [];
        // let lastShape: Shape;
        for (let shape of shapeChain) {
            shapes.push(shape);
            // area.add(shape);
            // lastShape = shape;
        }
        polyshapes.push(new Polyshape({shapes}));
    }
    return polyshapes;
}

// export function layerToCuts(layer: Layer): Cut[] {

//     // TODO ?
//     // Translate Area, and all Geometry in it, so that 0,0 is at bottom-left
//     // const area = new Area();
//     // ... add each shape in graph...
//     // area.translate(-area.min.x, -area.min.y);   

//     // Create Cuts from Shapes in Drawing Layers
//     const cuts: Cut[] = [];
//     for (const geometries of layer.geometries) {

//         // TODO Each Polyshape is a Cut
//         const cut: Cut = new Cut({ path: polyshape });

//         // TODO tweak Cut/Path based on Operation settings
//         // - Hole underspeed?
//         // - Add leads?

//         cuts.push(cut);
//     }

//     return cuts;
// }

/**
 * Group one or more Cut(s) it one or more Part(s).
 * This is many-to-many since groupings are unpredictable.
 */
export function cutsToParts(cuts: Cut[]): Part[] {
    // Create nodes for each polygon with properties for parent and children
    interface Node {
        cut: Cut;
        parent: Node | null;
        children: Node[];
    }
    let nodes: Node[] = cuts.map((cut: Cut) => ({ cut: cut, parent: null, children: [] }));

    // Assign parent to each node based on containment
    for (let i = 0; i < nodes.length; i++) {
        let nodeP = nodes[i];
        for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue;
            let nodeQ = nodes[j];
            if (polyshapeContains(nodeQ.cut.path, nodeP.cut.path)) {
                if (
                    nodeP.parent === null ||
                    polyshapeContains(nodeQ.cut.path, nodeP.parent.cut.path)
                ) {
                    nodeP.parent = nodeQ;
                }
            }
        }
    }

    // Build children arrays for each node
    for (let node of nodes) {
        if (node.parent) {
            node.parent.children.push(node);
        }
    }

    // Find all outermost polygons (roots of containment trees)
    let roots = nodes.filter((node) => node.parent === null);

    // Recursive function to process into Parts
    let parts: Part[] = [];
    function processNode(node: Node) {
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