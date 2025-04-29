import type { Drawing } from "$lib/domain/drawing/drawing/drawing";
import { OrientationEnum } from "$lib/geometry/geometry/geometry.enum";
import type { Polyshape } from "$lib/geometry/polyshape/polyshape";
import type { Shape } from "$lib/geometry/shape/shape";
import { shapeChains } from "$lib/geometry/shape/shape.function";
import { Cut } from "../cut/cut";
import { cutNesting, type CutNestingNode } from "../cut/cut.function";
import type { Part } from "../part/part";
import { Plan } from "./plan";
import { cutsRootsToParts, reorientShapes, geometriesToPolyshapes as shapeChainsToPolyshapes } from "./plan.function";

export namespace Planning {
    
    export function fromDrawing(drawing: Drawing|undefined): Plan|undefined {

        const plan = new Plan();

        if (! drawing)
            return undefined;

        for (const layer of drawing.layers) {

            // Find chains of Shapes that are connected by overlapping start and end points
            // We find all possible connections, not just end to start points.
            const shapeChain: Shape[][] = shapeChains(layer.geometries);

            // Transform Layer geometries to connected Polyshapes
            const polyshapes: Polyshape[] = shapeChainsToPolyshapes(shapeChain);

            // TODO link together all shapes where start/end points are nearly, but not
            //  exactly the same. We should be able to simply iterate over shapeChain: Shape[][]
            //  and make sure all shapes are forward connected.
            polyshapes.forEach(ps => ps.orient());

            // TODO Make sure all shapes are oriented in the same direction
            // Should be done in Polyshape.orient()
            //      polyshapes.forEach(ps => ps.orient());
            // This isn't intelligent enough
            //      shapeChain.forEach((shapeChain: Shape[]) => reorientShapes(shapeChain));
            
            // TODO Make sure winding direction of all shapes is the same.
            // Shape chains are not necessarily sorted in any particular direction, 
            // so reverse shapes as needed so that they are.
            // Could also be done with Polyshape.orient(OrientationEnum.COUNTERCLOCKWISE)

            // Build up a list of Cuts. Each Polyshape is a Cut path.
            const cuts: Cut[] = polyshapes.map((path: Polyshape) => new Cut({path}));

            // Group cuts into nesting hierarchy
            const cutRoots: CutNestingNode[] = cutNesting(cuts);

            // Group Cut(s) into Part(s)
            const parts: Part[] = cutsRootsToParts(cutRoots);

            // TODO Add Leads if needed 

            // TODO Add offsets to paths if needed

            // TODO Add/optimize Rapid moves between Cuts
            //
            // Works on parts, instead of cuts, because we have to consider
            // if cuts are holes or shells of parts.
            // PathOptimizer.optimize(parts);

            plan.parts.push(...parts);
        }

        return plan;    
    }
}