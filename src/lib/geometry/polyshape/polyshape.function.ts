import type { BoundaryData } from "../boundary/boundary.data";
import { boundaryJoin } from "../boundary/boundary.function";
import type { LineData } from "../line/line.data";
import { lineIntersects } from "../line/line.function";
import type { PointData } from "../point/point.data";
import { pointCoincident, pointEnclosedByPolygon } from "../point/point.function";
import type { Shape } from "../shape/shape";
import { Polyshape } from "./polyshape";
import type { PolyshapeData } from "./polyshape.data";
import { SpatialIndex } from "./spatial-index";

export function polyshapeIsClosed(polyshape: PolyshapeData): boolean {
    const startPoint: PointData = polyshape.shapes[0].startPoint;
    const endPoint: PointData = polyshape.shapes[polyshape.shapes.length - 1].endPoint;
    // TODO get tolerance from configuration
    return pointCoincident(startPoint, endPoint, 0.005);
}

export function polyshapeBoundary(polyshape: PolyshapeData): BoundaryData {
    return polyshape.shapes.reduce((bb: BoundaryData, shape: Shape) => {
        return boundaryJoin(bb, shape.boundary);
    }, { startPoint: { x: 0, y: 0 }, endPoint: { x: 0, y: 0 } });
}

// Function to check for intersections between two chains
export function polyshapeIntersects(chainA: PointData[], chainB: PointData[]) {
    for (let i = 0; i < chainA.length - 1; i++) {
        const a1 = chainA[i];
        const a2 = chainA[i + 1];
        for (let j = 0; j < chainB.length - 1; j++) {
            const b1 = chainB[j];
            const b2 = chainB[j + 1];
            if (lineIntersects(a1, a2, b1, b2)) {
                return true;
            }
        }
    }
    return false;
}

/** Convert polyshape to array of points */
export function polyshapeSample(polyshape: PolyshapeData, samples: number = 1000): PointData[] {
    // Collect points from all child shapes
    const points: PointData[] = [];
    polyshape.shapes.forEach(shape => {
        points.push(...shape.tessellate(samples));
    });
    return points;
}

/**
 * Calculate middle point of polyshape.
 * Samples points along all shapes and finds the middle point.
 */
export function polyshapeMiddlePoint(polyshape: PolyshapeData): PointData {
    // Sample points along all shapes
    const points = polyshapeSample(polyshape, 1000);
    
    if (points.length < 2) {
        // Return first point if not enough points
        return points[0] || { x: 0, y: 0 };
    }

    // Get middle point (round down for even number of points)
    const midIndex = Math.floor((points.length - 1) / 2);
    return points[midIndex];
}

