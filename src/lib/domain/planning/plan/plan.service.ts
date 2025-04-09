import type { Drawing } from "$lib/domain/drawing/drawing/drawing";
import type { Polyshape } from "$lib/geometry/polyshape/polyshape";
import type { Shape } from "$lib/geometry/shape/shape";
import { shapeChains } from "$lib/geometry/shape/shape.function";
import { Cut } from "../cut/cut";
import type { Part } from "../part/part";
import { Plan } from "./plan";
import { cutsToParts, geometriesToPolyshapes as shapeChainsToPolyshapes } from "./plan.function";

export namespace Planning {
    
    export function fromDrawing(drawing: Drawing|undefined): Plan|undefined {

        const plan = new Plan();

        if (! drawing)
            return undefined;

        for (const layer of drawing.layers) {
            // Connect all shapes end-to-start within given tolerance
            const shapeChain: Shape[][] = shapeChains(layer.geometries, 0.005);
            console.log('shapeChains', shapeChain);

            // Transform Layer geometries to connected Polyshapes
            const polyshapes: Polyshape[] = shapeChainsToPolyshapes(shapeChain);
            console.log('polyshapes', polyshapes);

            // Build up a list of Cuts
            const cuts: Cut[] = polyshapes.map((path: Polyshape) => new Cut({path}));
            console.log('cuts', cuts);

            // Group Cut(s) into Part(s)
            const parts: Part[] = cutsToParts(cuts);
            console.log('parts', parts);

            // TODO Optimize Rapid moves between Cuts
            // Works on parts, instead of cuts, because we have to consider
            // if cuts are holes or shells of parts.
            // PathOptimizer.optimize(parts);

            plan.parts.push(...parts);
        }

        return plan;    
    }
}