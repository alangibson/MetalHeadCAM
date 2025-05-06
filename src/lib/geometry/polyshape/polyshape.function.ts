import type { BoundaryData } from "../boundary/boundary.data";
import { boundaryJoin } from "../boundary/boundary.function";
import type { LineData } from "../line/line.data";
import { lineIntersects } from "../line/line.function";
import type { PointData } from "../point/point.data";
import { pointCoincident, pointEnclosedByPolygon, pointDistance } from "../point/point.function";
import type { Shape } from "../shape/shape";
import { Polyshape } from "./polyshape";
import type { PolyshapeData } from "./polyshape.data";
import { OrientationEnum } from "../geometry/geometry.enum";
import { GeometryFactory, Coordinate } from 'jsts/org/locationtech/jts/geom';
import IsSimpleOp from 'jsts/org/locationtech/jts/operation/IsSimpleOp';
import { roundToDecimalPlaces } from "$lib/utils/numbers";
import { DECIMAL_PRECISION } from "$lib/domain/importing/config/defaults";

/**
 * Polyshape is closed if end-to-start points of all child shapes are coincident.
 * All child shapes must be in the same orientation for this to work reliably.
 */
export function polyshapeIsClosed(polyshape: PolyshapeData): boolean {
    const startPoint: PointData = polyshape.shapes[0].startPoint;
    const endPoint: PointData = polyshape.shapes[polyshape.shapes.length - 1].endPoint;
    return pointCoincident(startPoint, endPoint);
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
export function polyshapeTessellate(polyshape: PolyshapeData, samples: number = 1000): PointData[] {
    const points: PointData[] = [];
    // Collect points from all child shapes
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
    const points = polyshapeTessellate(polyshape, 1000);
    
    if (points.length < 2) {
        // Return first point if not enough points
        return points[0] || { x: 0, y: 0 };
    }

    // Get middle point (round down for even number of points)
    const midIndex = Math.floor((points.length - 1) / 2);
    return points[midIndex];
}

/**
 * Calculate the signed area of a polyshape.
 * Positive area indicates clockwise orientation, negative indicates counterclockwise.
 */
export function polyshapeArea(polyshape: PolyshapeData): number {
    const points = polyshapeTessellate(polyshape, 1000);
    let area = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        area += (next.x - current.x) * (next.y + current.y);
    }
    
    // Add the last segment
    const last = points[points.length - 1];
    const first = points[0];
    area += (first.x - last.x) * (first.y + last.y);
    
    return area;
}

export function polyshapeReverseShapes(shapes: Shape[]): Shape[] {
    shapes.reverse();
    for (const shape of shapes) {
        shape.reverse();
    }
    return shapes;
}

/**
 * Orient the shapes in a polyshape to ensure they connect end-to-start.
 * Optionally specify a desired orientation (clockwise/counterclockwise).
 * This function will reorder the shapes as needed to ensure proper connections.
 */
export function polyshapeConnectShapes(shapez: Shape[]): Shape[] {
    const shapes = [...shapez];
    const orderedShapes: Shape[] = [];
    
    // Start with the first shape
    let currentShape = shapes.shift();
    orderedShapes.push(currentShape);

    // Keep finding the next shape that connects to the current one
    while (shapes.length > 0) {
        // console.log('currentShape', currentShape);
        let foundNext = false;
        
        // Try to find a shape that connects to the current shape's end point
        for (let i = 0; i < shapes.length; i++) {
            const nextShape = shapes[i];
            
            // console.log('nextShape', nextShape);

            // Check if the next shape's start point connects to current shape's end
            if (currentShape.endPoint.coincident(nextShape.startPoint)) {
                // console.log('currentShape.endPoint and nextShape.startPoint are coincident.');
                shapes.splice(i, 1);
                orderedShapes.push(nextShape);
                currentShape = nextShape;
                foundNext = true;
                break;
            }
            // Check if the next shape's end point connects to current shape's end
            else if (currentShape.endPoint.coincident(nextShape.endPoint)) {
                // console.log('currentShape.endPoint and nextShape.endPoint are coincident. Reversing nextShape');
                nextShape.reverse();
                shapes.splice(i, 1);
                orderedShapes.push(nextShape);
                currentShape = nextShape;
                foundNext = true;
                break;
            }

            // TODO What if the next shape's start point connects to current shape's start
            // TODO What if the next shape's end point connects to current shape's start
        }

        // If we couldn't find a connecting shape, we need to handle this case
        if (!foundNext) {
            // Find the closest points between any remaining shapes and the current shape
            let minDistance = Infinity;
            let bestShapeIndex = -1;
            let bestShape = null;
            let bestShapeNeedsReverse = false;
            let currentShapeNeedsReverse = false;
            
            for (let i = 0; i < shapes.length; i++) {
                const nextShape = shapes[i];
                const distance1 = pointDistance(currentShape.endPoint, nextShape.startPoint);
                const distance2 = pointDistance(currentShape.endPoint, nextShape.endPoint);
                const distance3 = pointDistance(currentShape.startPoint, nextShape.startPoint);
                const distance4 = pointDistance(currentShape.startPoint, nextShape.endPoint);
                
                if (distance1 < minDistance) {
                    minDistance = distance1;
                    bestShapeIndex = i;
                    bestShape = nextShape;
                    bestShapeNeedsReverse = false;
                    currentShapeNeedsReverse = false;
                }
                if (distance2 < minDistance) {
                    minDistance = distance2;
                    bestShapeIndex = i;
                    bestShape = nextShape;
                    bestShapeNeedsReverse = true;
                    currentShapeNeedsReverse = false;
                }
                if (distance3 < minDistance) {
                    minDistance = distance3;
                    bestShapeIndex = i;
                    bestShape = nextShape;
                    bestShapeNeedsReverse = false;
                    currentShapeNeedsReverse = true;
                }
                if (distance4 < minDistance) {
                    minDistance = distance4;
                    bestShapeIndex = i;
                    bestShape = nextShape;
                    bestShapeNeedsReverse = true;
                    currentShapeNeedsReverse = true;
                }
            }
            
            if (bestShape) {
                if (currentShapeNeedsReverse) {
                    currentShape.reverse();
                }
                if (bestShapeNeedsReverse) {
                    bestShape.reverse();
                }
                shapes.splice(bestShapeIndex, 1);
                orderedShapes.push(bestShape);
                currentShape = bestShape;
            } else {
                // If we can't find any shape to connect, break the loop
                break;
            }
        }
    }

    // Add any remaining shapes at the end
    if (shapes.length > 0) {
        orderedShapes.push(...shapes);
    }

    // Update the polyshape with the ordered shapes
    return orderedShapes;

}

/**
 * Check if a polyshape intersects with itself.
 * Uses JSTS to perform the intersection check.
 */
export function polyshapeIsSimple(polyshape: PolyshapeData): boolean {
    const geometryFactory = new GeometryFactory();
    
    // Get points from the polyshape
    const points = polyshapeTessellate(polyshape, 1000);
    const coords = points.map(p => new Coordinate(roundToDecimalPlaces(p.x, DECIMAL_PRECISION), roundToDecimalPlaces(p.y, DECIMAL_PRECISION)));
    
    // Create a LineString from the points
    const lineString = geometryFactory.createLineString(coords);
    
    // Check if the LineString is simple (no self-intersections)
    return IsSimpleOp.isSimple(lineString);
}
