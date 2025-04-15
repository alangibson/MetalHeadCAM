import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { PolyshapeData } from "./polyshape.data";
import { polyshapeIsClosed } from "./polyshape.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { polyshapeSample, polyshapeMiddlePoint } from "./polyshape.function";
import { boundaryJoin } from "../boundary/boundary.function";
import { pointCoincident } from "../point/point.function";
import { SpatialIndex } from "./spatial-index";
import { lineIntersects } from "../line/line.function";
import { shapeAreaFromPoints } from "../shape/shape.function";

export class Polyshape implements PolyshapeData, Shape {

    type = GeometryTypeEnum.POLYSHAPE;
    shapes: Shape[];
    _sample: Point[] | undefined;
    _boundary: Boundary | undefined;
    _spatialIndex: SpatialIndex|undefined;

    constructor(data: PolyshapeData) {
        this.shapes = data.shapes;
    }

    get startPoint(): Point {
        return new Point(this.shapes[0].startPoint);
    }

    get endPoint(): Point {
        return new Point(this.shapes[this.shapes.length - 1].endPoint);
    }

    get isClosed(): boolean {
        return polyshapeIsClosed(this);
    }

    get boundary(): Boundary {
        if (!this._boundary)
            this._boundary = this.shapes.reduce<Boundary>((bb, shape) => bb.join(shape.boundary),
                new Boundary({
                    startPoint: { x: 0, y: 0 },
                    endPoint: { x: 0, y: 0 },
                }))
        return this._boundary;
    }

    get middlePoint(): Point {
        return new Point(polyshapeMiddlePoint(this));
    }

    get area(): number | null {
        if (!this.isClosed) return null;
        return shapeAreaFromPoints(this.sample(1000));
    }

    get length(): number {
        return this.shapes.reduce((total, shape) => total + shape.length, 0);
    }

    clearCache(): void {
        this._sample = undefined;
        this._boundary = undefined;
    }

    transform(transform: TransformData): void {
        this.shapes.forEach(shape => shape.transform(transform));
        this.clearCache();
    }

    /**
     * Test if inner polyshape is fully contained within outer polyshape.
     * Uses bounding box optimization and ray casting.
     * Time complexity: O(n log n) where n is total number of points
     */
    contains(innerPolyshape: Polyshape): boolean {

        const outerPolyshape: Polyshape = this;

        // Quick reject: if inner's bounding box isn't inside outer's, 
        // it can't be contained
        if (! outerPolyshape.boundary.contains(innerPolyshape.boundary))
            return false;

        // Sample points along both shapes
        const innerPoints = innerPolyshape.sample(1000);
        const outerPoints = outerPolyshape.sample(1000);

        // Ensure outer shape is closed for point-in-polygon test
        if (!pointCoincident(outerPoints[0], outerPoints[outerPoints.length - 1])) {
            outerPoints.push(outerPoints[0]);
        }

        // Test sample points from inner shape using ray casting
        // TODO don't test every 3rd point for speed. Just sample fewer points
        // for (let i = 0; i < innerPoints.length; i += 3) { // Test every 3rd point for speed
        //     const point = innerPoints[i];
        //     // Ray casting test
        //     if (!pointEnclosedByPolygon(point, outerPoints)) {
        //         return false;
        //     }
        // }

        // Build spatial index for outer points to speed up intersection tests

        // const outerSegments = new SpatialIndex(outerPoints);
        if (! this._spatialIndex)
            this._spatialIndex = new SpatialIndex(outerPoints);
        // Test for intersections using spatial index
        for (let i = 0; i < innerPoints.length - 1; i++) {
            const p1 = innerPoints[i];
            const p2 = innerPoints[i + 1];

            // Quick reject using bounding box of line segment
            const minX = Math.min(p1.x, p2.x);
            const maxX = Math.max(p1.x, p2.x);
            const minY = Math.min(p1.y, p2.y);
            const maxY = Math.max(p1.y, p2.y);

            // Get potentially intersecting segments from spatial index
            const potentialSegments = this._spatialIndex.query(minX, minY, maxX, maxY);

            // Test against potential segments
            for (const segment of potentialSegments) {
                if (lineIntersects(p1, p2, segment.startPoint, segment.endPoint)) {
                    return false;
                }
            }
        }

        return true;
    }

    sample(sample: number = 1000): Point[] {
        if (!this._sample)
            this._sample = polyshapeSample(this, sample).map(p => new Point(p))
        return this._sample;
    }

}