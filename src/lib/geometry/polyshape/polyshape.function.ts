import { arcSample } from "../arc/arc.function";
import { Boundary } from "../boundary/boundary";
import type { BoundaryData } from "../boundary/boundary.data";
import { boundaryJoin } from "../boundary/boundary.function";
import { circleSample } from "../circle/circle.function";
import { cubicCurveSample } from "../cubic-curve/cubic-curve.function";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { lineIntersects } from "../line/line.function";
import type { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import { pointCoincident, pointEnclosedByPolygon } from "../point/point.function";
import { quadraticCurveSample } from "../quadratic-curve/quadratic-curve.function";
import type { Shape } from "../shape/shape";
import { Polyshape } from "./polyshape";
import type { PolyshapeData } from "./polyshape.data";

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

// Determine if Chain A is enclosed by Chain B
export function polyshapeContains(outer: Polyshape, inner: Polyshape) {
    // Approximate curves in chains to polylines
    const innerPoints: PointData[] = [];
    inner.shapes.forEach((shape: Shape) => {
        // if (shape.type === GeometryTypeEnum.LINE) {
        //     innerPoints.push(shape.startPoint, shape.endPoint);
        // } else if (shape.type === GeometryTypeEnum.ARC) {
        //     innerPoints.push(...arcToPoints(shape));
        // } else if (shape.type === GeometryTypeEnum.CUBIC_CURVE) {
        //     innerPoints.push(...cubicCurveToPoints(shape));
        // } else if (shape.type === GeometryTypeEnum.QUADRATIC_CURVE) {
        //     innerPoints.push(...quadraticCurveToPoints(shape));
        // } else if (shape.type === GeometryTypeEnum.CIRCLE) {
        //     innerPoints.push(...circleToPoints(shape));
        // } else {
        //     throw new Error(`Unsupported geometry: ${shape.type}`);
        // }
        innerPoints.push(...shape.sample());
    });

    const outerPoints: PointData[] = [];
    outer.shapes.forEach((shape: Shape) => {
        // if (shape.type === GeometryTypeEnum.LINE) {
        //     outerPoints.push(shape.startPoint, shape.endPoint);
        // } else if (shape.type === GeometryTypeEnum.ARC) {
        //     outerPoints.push(...arcToPoints(shape));
        // } else if (shape.type === GeometryTypeEnum.CUBIC_CURVE) {
        //     outerPoints.push(...cubicCurveToPoints(shape));
        // } else if (shape.type === GeometryTypeEnum.QUADRATIC_CURVE) {
        //     outerPoints.push(...quadraticCurveToPoints(shape));
        // } else if (shape.type === GeometryTypeEnum.CIRCLE) {
        //     outerPoints.push(...circleToPoints(shape));
        // } else {
        //     throw new Error(`Unsupported geometry: ${shape.type}`);
        // }
        outerPoints.push(...shape.sample());
    });

    // Ensure chains are closed
    // TODO refactor into its own function
    if (
        outerPoints[0].x !== outerPoints[outerPoints.length - 1].x ||
        outerPoints[0].y !== outerPoints[outerPoints.length - 1].y
    ) {
        outerPoints.push(outerPoints[0]);
    }

    // Step 1: Check for intersections
    if (polyshapeIntersects(innerPoints, outerPoints)) {
        return false;
    }

    // Step 2: Check if all points in Chain A are inside Chain B
    for (let i = 0; i < innerPoints.length; i += 5) {
        const point = innerPoints[i];
        if (!pointEnclosedByPolygon(point, outerPoints)) {
            return false;
        }
    }

    return true;
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
export function polyshapeSample(polyshape: PolyshapeData, samples: number = 20): PointData[] {
    // Collect points from all child shapes
    const points: PointData[] = [];
    polyshape.shapes.forEach(shape => {
        points.push(...shape.sample(samples));
    });
    return points;
}
