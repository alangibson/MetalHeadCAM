import type { Drawing } from "$lib/domain/drawing/drawing/drawing";
import type { Polyshape } from "$lib/geometry/polyshape/polyshape";
import type { Shape } from "$lib/geometry/shape/shape";
import { shapeChains } from "$lib/geometry/shape/shape.function";
import { Cut } from "../cut/cut";
import type { Part } from "../part/part";
import { Plan } from "./plan";
import { cutsToParts, reorientShapes, geometriesToPolyshapes as shapeChainsToPolyshapes } from "./plan.function";

export namespace Planning {
    
    export function fromDrawing(drawing: Drawing|undefined): Plan|undefined {

        const plan = new Plan();

        if (! drawing)
            return undefined;

        for (const layer of drawing.layers) {
            // Find chains of Shapes that are connected by overlapping start and end points
            const shapeChain: Shape[][] = shapeChains(layer.geometries, 0.05);

            // Shape chains are not necessarily sorted end-to-start, 
            // so reverse shapes a needed so that they are.
            shapeChain.forEach((shapeChain: Shape[]) => reorientShapes(shapeChain, 0.05));

            // Transform Layer geometries to connected Polyshapes
            const polyshapes: Polyshape[] = shapeChainsToPolyshapes(shapeChain);

            // Build up a list of Cuts. Each Polyshape is a Cut path.
            const cuts: Cut[] = polyshapes.map((path: Polyshape) => new Cut({path}));

            // Group Cut(s) into Part(s)
            const parts: Part[] = cutsToParts(cuts);

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