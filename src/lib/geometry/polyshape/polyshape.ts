// import polygonClipping from 'polygon-clipping';
import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import { Shape } from "../shape/shape";
import type { PolyshapeData } from "./polyshape.data";
import { polyshapeIsClosed, polyshapeIsSimple, polyshapeMiddlePoint, polyshapeReverseShapes, polyshapeTessellate } from "./polyshape.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import { shapeAreaFromPoints } from "../shape/shape.function";
import type { AngleRadians } from "../angle/angle.type";
import { GeometryFactory, Coordinate } from 'jsts/org/locationtech/jts/geom';
import { RelateOp } from 'jsts/org/locationtech/jts/operation/relate';
import { polyshapeArea } from "./polyshape.function";
import { pointCoincident, pointDistance } from "../point/point.function";
import { polyshapeConnectShapes } from "./polyshape.function";
import { roundToDecimalPlaces } from "$lib/geometry/number/numbers";
import { DECIMAL_PRECISION } from "$lib/domain/importing/config/defaults";
import type { Circle } from "../circle/circle";
import type { Spline } from "../spline/spline";
import { Line } from "../line/line";
import type { Arc } from "../arc/arc";
import { BufferOp } from 'jsts/org/locationtech/jts/operation/buffer';

export class Polyshape extends Shape implements PolyshapeData {

    type = GeometryTypeEnum.POLYSHAPE;
    shapes: Shape[];
    private _isClosed?: boolean;
    private _isSimple?: boolean;
    private _sample?: Point[];
    private _boundary?: Boundary;
    private _middlePoint?: Point;

    constructor(data: PolyshapeData) {
        super();
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

    /** True if not self-intersecting */
    get isSimple(): boolean {
        if (this._isSimple === undefined)
            this._isSimple = polyshapeIsSimple(this);
        return this._isSimple;
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
        return shapeAreaFromPoints(this.tessellate());
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
        const outerPoints = this.tessellate();
        const outerCoords = outerPoints.map(p => new Coordinate(roundToDecimalPlaces(p.x, DECIMAL_PRECISION), roundToDecimalPlaces(p.y, DECIMAL_PRECISION)));
        if (outerCoords.length < 4) {
            console.warn('outerCoords.length < 4', outerCoords);
            return false;
        } 
        const outerLinearRing = geometryFactory.createLinearRing(outerCoords);
        const outerPolygon = geometryFactory.createPolygon(outerLinearRing);

        // Convert inner polyshape to JSTS geometry
        const innerPoints = innerPolyshape.tessellate();
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

    tessellate(sample?: number): Point[] {
        if (! sample)
            sample = this.length;
        this._sample = polyshapeTessellate(this, sample).map(p => new Point(p))
        return this._sample;
    }

    orient(orientation?: OrientationEnum): void {
        this.shapes = polyshapeConnectShapes(this.shapes);
        // TODO change orientation, if needed
        this.clearCache();
    }

    tangentAt(point: PointData): AngleRadians {
        // Find the closest segment to the point
        let closestShape: Shape | null = null;
        let minDistance = Infinity;

        // Sample points along each segment to find the closest one
        for (const shape of this.shapes) {
            const points = shape.tessellate();

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
        return closestShape.tangentAt(point);
    }

    clone(): Polyshape {
		return new Polyshape({
			shapes: this.shapes.map(shape => shape.clone())
		});
	}

    offset(distance: number): void {
        // Offset each shape in the polyshape by the given distance
        this.shapes.forEach(shape => shape.offset(distance));


        // Get all points from the shape
        const points = this.tessellate();
        
        // Create JSTS geometry
        const geometryFactory = new GeometryFactory();
        const coords = points.map(p => new Coordinate(
            roundToDecimalPlaces(p.x, DECIMAL_PRECISION), 
            roundToDecimalPlaces(p.y, DECIMAL_PRECISION)
        ));
        
        // Create a polygon and buffer it
        // const linearRing = geometryFactory.createLinearRing(coords);
        // const polygon = geometryFactory.createPolygon(linearRing);
        // const buffered = BufferOp.bufferOp(polygon, 0);
        
        const lineString = geometryFactory.createLineString(coords);
        const buffered = BufferOp.bufferOp(lineString, 0);
        
        // Get the cleaned coordinates
        const cleanedCoords = buffered.getCoordinates();
        
        // Create new shapes preserving the original types
        let currentShape: Shape | null = null;
        
        for (let i = 0; i < cleanedCoords.length - 1; i++) {
            const start = { x: cleanedCoords[i].x, y: cleanedCoords[i].y };
            const end = { x: cleanedCoords[i + 1].x, y: cleanedCoords[i + 1].y };
            
            // Find the original shape that best matches this segment
            const originalShape = this.shapes.find(s => {
                const shapeStart = s.startPoint;
                const shapeEnd = s.endPoint;
                return (pointCoincident(shapeStart, start) && pointCoincident(shapeEnd, end)) ||
                        (pointCoincident(shapeStart, end) && pointCoincident(shapeEnd, start));
            });
            
            if (originalShape) {
                
                // Update the shape's points while preserving its type
                switch (originalShape.type) {
                    case GeometryTypeEnum.ARC:
                        const arc = currentShape as Arc;
                        // Update arc parameters to match new start/end points
                        arc.origin = new Point({
                            x: (start.x + end.x) / 2,
                            y: (start.y + end.y) / 2
                        });
                        arc.radius = Math.sqrt(
                            Math.pow(end.x - start.x, 2) + 
                            Math.pow(end.y - start.y, 2)
                        ) / 2;
                        arc.startAngle = Math.atan2(start.y - arc.origin.y, start.x - arc.origin.x);
                        arc.endAngle = Math.atan2(end.y - arc.origin.y, end.x - arc.origin.x);
                        break;
                        
                    case GeometryTypeEnum.CIRCLE:
                        const circle = currentShape as Circle;
                        circle.origin = new Point({
                            x: (start.x + end.x) / 2,
                            y: (start.y + end.y) / 2
                        });
                        circle.radius = Math.sqrt(
                            Math.pow(end.x - start.x, 2) + 
                            Math.pow(end.y - start.y, 2)
                        ) / 2;
                        break;
                        
                    case GeometryTypeEnum.SPLINE:
                        const spline = currentShape as Spline;
                        // Update control points to match new start/end points
                        spline.controlPoints[0] = new Point(start);
                        spline.controlPoints[spline.controlPoints.length - 1] = new Point(end);
                        // Adjust intermediate control points proportionally
                        for (let j = 1; j < spline.controlPoints.length - 1; j++) {
                            const t = j / (spline.controlPoints.length - 1);
                            spline.controlPoints[j] = new Point({
                                x: start.x + (end.x - start.x) * t,
                                y: start.y + (end.y - start.y) * t
                            });
                        }
                        break;
                        
                    case GeometryTypeEnum.LINE:
                        const line = currentShape as Line;
                        line.startPoint = new Point(start);
                        line.endPoint = new Point(end);
                        break;
                }
                
                // newShapes.push(currentShape);
            } else {
                console.warn('Couldnt find original shape');
            }
        }

        this.clearCache();
    }

}