import type { Drawing } from "$lib/domain/drawing/drawing/drawing";
import { Circle } from "$lib/geometry/circle/circle";
import { OrientationEnum } from "$lib/geometry/geometry/geometry.enum";
import { Line } from "$lib/geometry/line/line";
import type { Polyshape } from "$lib/geometry/polyshape/polyshape";
import type { Shape } from "$lib/geometry/shape/shape";
import { shapeChains } from "$lib/geometry/shape/shape.function";
import { Cut } from "../cut/cut";
import { cutNesting, type CutNestingNode } from "../cut/cut.function";
import type { Part } from "../part/part";
import { Plan } from "./plan";
import { cutsRootsToParts, geometriesToPolyshapes as shapeChainsToPolyshapes } from "./plan.function";

export namespace Planning {
    
    export function fromDrawing(drawing: Drawing|undefined): Plan|undefined {

        const plan = new Plan();

        if (! drawing)
            return undefined;

        // Flatten layers into just Shapes
        const geometries: Shape[] = [];
        for (const layer of drawing.layers) {
            geometries.push(...layer.geometries);
        }

        // TODO Explode all shapes inside Polyshapes in geometries?
        // We're past the drawing phase so we don't need full fidelity for (LW)POLYLINES 
        // Explode Polyshapes into their constituent shapes
        const explodedGeometries: Shape[] = [];
        for (const geometry of geometries) {
            if ('shapes' in geometry) {
                // This is a Polyshape, add all its shapes
                explodedGeometries.push(...(geometry as Polyshape).shapes);
            } else {
                // This is a regular Shape, add it directly
                explodedGeometries.push(geometry);
            }
        }
        // Replace original geometries with exploded ones
        geometries.length = 0;
        geometries.push(...explodedGeometries);

        // TODO we should really throw these away earlier
        // Filter out any lines where start and end points are the same
        const filteredGeometries = geometries.filter(shape => {
            if (! (shape instanceof Line)) return true;
            const start = shape.startPoint;
            const end = shape.endPoint;
            return !(start.x === end.x && start.y === end.y);
        });

        // Find chains of Shapes that are connected by overlapping start and end points
        // We find all possible connections, not just end to start points.
        const shapeChain: Shape[][] = shapeChains(filteredGeometries);

        // Transform Layer geometries to connected Polyshapes
        const polyshapes: Polyshape[] = shapeChainsToPolyshapes(shapeChain);

        // Link together all shapes where start/end points are nearly or exactly the same. 
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
        
        // Save Parts
        plan.parts.push(...parts);

        // Translate Parts so orgin is 0,0
        const boundingBox = plan.boundary;
        plan.transform({
            translateX: -boundingBox.startPoint.x,
            translateY: -boundingBox.startPoint.y
        });

        return plan;    
    }
}