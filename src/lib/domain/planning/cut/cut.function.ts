import type { Cut } from "./cut";

// Create nodes for each polygon with properties for parent and children
export interface CutNestingNode {
    cut: Cut;
    parent: CutNestingNode | null;
    children: CutNestingNode[];
}

/**
 * Build hierarchy of parent-child containment relationships.
 * Open paths can be contained within closed paths.
 */
export function cutNesting(cuts: Cut[]): CutNestingNode[] {
    // Begin with a flat list of nodes
    const nodes: CutNestingNode[] = cuts.map((cut: Cut) => ({ 
        cut: cut, 
        parent: null, 
        children: [] 
    }));

    // Separate closed and open paths
    const closedNodes = nodes.filter(node => node.cut.path.isClosed);
    const openNodes = nodes.filter(node => !node.cut.path.isClosed);

    console.log('closedNodes', closedNodes);
    console.log('openNodes', openNodes);

    // Sort closed nodes by area (largest first)
    closedNodes.sort((a, b) => {
        const areaA = a.cut.path.area;
        const areaB = b.cut.path.area;
        return areaB - areaA;
    });

    // For each closed node, find its smallest containing parent
    for (let i = 1; i < closedNodes.length; i++) {
        const closedNode = closedNodes[i];
        let bestParent: CutNestingNode | null = null;
        let smallestArea = Infinity;

        // Only check nodes that are larger (earlier in array)
        for (let j = 0; j < i; j++) {
            const potential = closedNodes[j];

            // Quick reject if potential parent's boundary doesn't contain current's
            // if (!potential.cut.path.boundary.contains(closedNode.cut.path.boundary)) {
            //     continue;
            // }

            // Do full containment check
            if (potential.cut.path.contains(closedNode.cut.path)) {

                console.log('containment found', potential.cut, 'contains', closedNode.cut);

                const area = potential.cut.path.area;
                if (area < smallestArea) {
                    smallestArea = area;
                    bestParent = potential;
                }
            }
        }

        // If we found a parent, update relationships
        if (bestParent) {
            closedNode.parent = bestParent;
            bestParent.children.push(closedNode);
        }
    }

    // // For each open node, find its smallest containing closed path
    // for (const openNode of openNodes) {
    //     let bestParent: CutNestingNode | null = null;
    //     let smallestArea = Infinity;

    //     // Check all closed nodes as potential parents
    //     for (const closedNode of closedNodes) {

    //         // Quick reject if boundary doesn't contain open path's boundary
    //         // if (!closedNode.cut.path.boundary.contains(openNode.cut.path.boundary)) {
    //         //     continue;
    //         // }

    //         // Check if all points of open path are inside closed path
    //         if (closedNode.cut.path.contains(openNode.cut.path)) {
    //             const area = closedNode.cut.path.area;
    //             if (area < smallestArea) {
    //                 smallestArea = area;
    //                 bestParent = closedNode;
    //             }
    //         }
    //     }

    //     // If we found a parent, update relationships
    //     if (bestParent) {
    //         openNode.parent = bestParent;
    //         bestParent.children.push(openNode);
    //     }
    // }

    // Return only root nodes (those without parents)
    return nodes.filter(node => node.parent === null);
}
