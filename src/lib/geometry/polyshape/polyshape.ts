// import polygonClipping from 'polygon-clipping';
import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import type { Shape } from "../shape/shape";
import type { PolyshapeData } from "./polyshape.data";
import { polyshapeIsClosed, polyshapeMiddlePoint, polyshapeReverseShapes, polyshapeTessellate } from "./polyshape.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { shapeAreaFromPoints, shapeLengthFromPoints } from "../shape/shape.function";
import type { AngleRadians } from "../angle/angle.type";
import { GeometryFactory, Coordinate } from 'jsts/org/locationtech/jts/geom';
import { RelateOp } from 'jsts/org/locationtech/jts/operation/relate';
import { polyshapeArea } from "./polyshape.function";
import { pointDistance } from "../point/point.function";
import { polyshapeConnectShapes } from "./polyshape.function";
import { roundToDecimalPlaces } from "$lib/utils/numbers";
import { DECIMAL_PRECISION } from "$lib/input/config/defaults";

export class Polyshape implements PolyshapeData, Shape {

    type = GeometryTypeEnum.POLYSHAPE;
    shapes: Shape[];
    private _isClosed?: boolean;
    private _sample?: Point[];
    private _boundary?: Boundary;
    private _middlePoint?: Point;

    constructor(data: PolyshapeData) {
        this.shapes = data.shapes;
    }

    get startPoint(): Point {
        return this.shapes[0].startPoint;
    }

    set startPoint(point: Point) {
        this.shapes[0].startPoint = point;
    }

    get endPoint(): Point {
        return this.shapes[this.shapes.length - 1].endPoint;
    }

    set endPoint(point: Point) {
        this.shapes[this.shapes.length - 1].endPoint = point;
    }

    /** DXF files may define POLYLINES as being closed */
    get isClosed(): boolean {
        if (this._isClosed === undefined)
            this._isClosed = polyshapeIsClosed(this);
        return this._isClosed
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
        if (!this._middlePoint)
            this._middlePoint = new Point(polyshapeMiddlePoint(this));
        return this._middlePoint;
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
        this._middlePoint = undefined;
        this._isClosed = undefined;
    }

    transform(transform: TransformData): void {
        this.shapes.forEach(shape => shape.transform(transform));
        this.clearCache();
    }

    reverse(): void {
        this.shapes = polyshapeReverseShapes(this.shapes);
        this.clearCache();
    }

    /**
     * Test if inner polyshape is fully contained within outer polyshape.
     */
    contains(innerPolyshape: Polyshape): boolean {
        // An open shape can't contain anything
        if (this.isClosed == false)
            return false;
        
        const geometryFactory = new GeometryFactory();

        // Convert self (outer) to JSTS geometry
        const outerPoints = this.tessellate(1000);
        const outerCoords = outerPoints.map(p => new Coordinate(roundToDecimalPlaces(p.x, DECIMAL_PRECISION), roundToDecimalPlaces(p.y, DECIMAL_PRECISION)));
        if (outerCoords.length < 4) {
            console.warn('outerCoords.length < 4', outerCoords);
            return false;
        } 
        const outerLinearRing = geometryFactory.createLinearRing(outerCoords);
        const outerPolygon = geometryFactory.createPolygon(outerLinearRing);

        // Convert inner polyshape to JSTS geometry
        const innerPoints = innerPolyshape.tessellate(1000);
        const innerCoords = innerPoints.map(p => new Coordinate(roundToDecimalPlaces(p.x, DECIMAL_PRECISION), roundToDecimalPlaces(p.y, DECIMAL_PRECISION)));
        if (innerPolyshape.isClosed) {
            if (innerCoords.length < 4) {
                console.warn('innerCoords.length < 4', innerPolyshape);
                return false;
            }
            const innerLinearRing = geometryFactory.createLinearRing(innerCoords);
            const innerPolygon = geometryFactory.createPolygon(innerLinearRing);
            // Use JSTS RelateOp to check containment
            return RelateOp.contains(outerPolygon, innerPolygon);
        } else {
            // For open shapes, we need to check if all points of the inner 
            // shape are contained within the outer shape
            const innerLineString = geometryFactory.createLineString(innerCoords);
            return RelateOp.contains(outerPolygon, innerLineString);
        }

    }

    tessellate(sample: number = 1000): Point[] {
        // if (!this._sample)
        this._sample = polyshapeTessellate(this, sample).map(p => new Point(p))
        return this._sample;
    }

    orient(orientation?: OrientationEnum): void {
        this.shapes = polyshapeConnectShapes(this.shapes);
        // TODO change orientation, if needed
        this.clearCache();
    }

    bearingAt(point: PointData): AngleRadians {
        // Find the closest segment to the point
        let closestShape: Shape | null = null;
        let minDistance = Infinity;

        // Sample points along each segment to find the closest one
        for (const shape of this.shapes) {
            const points = shape.tessellate(1000);

            for (let i = 0; i < points.length - 1; i++) {

                // if (Number.isNaN(point.x))
                //     console.log('NaN point', point, shape);

                const distance = pointDistance(points[i], point);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestShape = shape;
                }
            }
        }

        if (!closestShape) {
            throw new Error("Could not find a segment close to the point");
        }

        // Return the bearing of the closest segment at the point
        return closestShape.bearingAt(point);
    }

}