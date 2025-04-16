// import polygonClipping from 'polygon-clipping';
import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { PolyshapeData } from "./polyshape.data";
import { polyshapeIsClosed } from "./polyshape.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import { polyshapeSample, polyshapeMiddlePoint } from "./polyshape.function";
import { shapeAreaFromPoints } from "../shape/shape.function";
import { GeometryFactory, Coordinate } from 'jsts/org/locationtech/jts/geom';
import { RelateOp } from 'jsts/org/locationtech/jts/operation/relate';

export class Polyshape implements PolyshapeData, Shape {

    type = GeometryTypeEnum.POLYSHAPE;
    shapes: Shape[];
    _sample: Point[] | undefined;
    _boundary: Boundary | undefined;

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
        return shapeAreaFromPoints(this.tessellate(1000));
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
    
    reverse(): void {
        this.shapes.forEach(shape => shape.reverse());
        this.clearCache();
        // throw new Error('not implemented');
    }
    /**
     * Test if inner polyshape is fully contained within outer polyshape.
     */
    contains(innerPolyshape: Polyshape): boolean {
        // Convert both polyshapes to JSTS geometries
        const geometryFactory = new GeometryFactory();
        
        // Convert self (outer) to JSTS geometry
        const outerPoints = this.tessellate(1000);
        const outerCoords = outerPoints.map(p => new Coordinate(p.x, p.y));
        const outerLinearRing = geometryFactory.createLinearRing(outerCoords);
        const outerPolygon = geometryFactory.createPolygon(outerLinearRing);

        // Convert inner polyshape to JSTS geometry
        const innerPoints = innerPolyshape.tessellate(1000);
        const innerCoords = innerPoints.map(p => new Coordinate(p.x, p.y));
        if (innerCoords.length < 4) {
            console.warn(innerPolyshape);
            return false;
        }
        const innerLinearRing = geometryFactory.createLinearRing(innerCoords);
        const innerPolygon = geometryFactory.createPolygon(innerLinearRing);

        // Use JSTS RelateOp to check containment
        return RelateOp.contains(outerPolygon, innerPolygon);
    }

    tessellate(sample: number = 1000): Point[] {
        if (!this._sample)
            this._sample = polyshapeSample(this, sample).map(p => new Point(p))
        return this._sample;
    }

}