// import polygonClipping from 'polygon-clipping';
import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { PolyshapeData } from "./polyshape.data";
import { polyshapeIsClosed } from "./polyshape.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import { polyshapeSample, polyshapeMiddlePoint } from "./polyshape.function";
import { shapeAreaFromPoints } from "../shape/shape.function";
import { GeometryFactory, Coordinate } from 'jsts/org/locationtech/jts/geom';
import { RelateOp } from 'jsts/org/locationtech/jts/operation/relate';
import { polyshapeArea } from "./polyshape.function";

export class Polyshape implements PolyshapeData, Shape {

    type = GeometryTypeEnum.POLYSHAPE;
    shapes: Shape[];
    private _sample?: Point[];
    private _boundary?: Boundary;

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

    get orientation(): OrientationEnum {
        if (!this.isClosed) return OrientationEnum.COLINEAR;
        const area = polyshapeArea(this);
        return area > 0 ? OrientationEnum.CLOCKWISE : OrientationEnum.COUNTERCLOCKWISE;
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
        // TODO getting this error very frequently
        //      IllegalArgumentException: Points of LinearRing do not form a closed linestring
        const outerLinearRing = geometryFactory.createLinearRing(outerCoords);
        const outerPolygon = geometryFactory.createPolygon(outerLinearRing);

        // Convert inner polyshape to JSTS geometry
        const innerPoints = innerPolyshape.tessellate(1000);
        const innerCoords = innerPoints.map(p => new Coordinate(p.x, p.y));
        if (innerCoords.length < 4) {
            console.warn('innerCoords.length < 4', innerPolyshape);
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

    orient(orientation?: OrientationEnum): void {
        // TODO get from somewhere
        const tolerance = 0.05;

        // Connect all child shapes end-to-start
        for (let i = 1; i < this.shapes.length; i++) {

            const prevShape: Shape = this.shapes[i - 1];
            const currentShape: Shape = this.shapes[i];

            if (prevShape instanceof Polyshape)
                prevShape.orient();

            if (prevShape.endPoint.coincident(currentShape.startPoint, tolerance)) {
                // Already correctly oriented
                continue;
            } else if (prevShape.endPoint.coincident(currentShape.endPoint, tolerance)) {
                // Reverse the current segment to match the end to start
                console.log('reverse currentShape', currentShape);
                currentShape.reverse();
            } else if (prevShape.startPoint.coincident(currentShape.startPoint, tolerance)) {
                // Reverse the previous segment to match the start to end
                console.log('reverse prevShape', prevShape);
                prevShape.reverse();
            } else if (prevShape.startPoint.coincident(currentShape.endPoint, tolerance)) {
                currentShape.reverse();
                prevShape.reverse();
                console.log('reverse currentShape', currentShape, 'and prevShape', prevShape);
            }
        }

        if (this.orientation && this.orientation != orientation)
            this.reverse();
    }

}