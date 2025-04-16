import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import type { Shape } from "../shape/shape";
import type { EllipseData } from "./ellipse.data";
import { ellipseBoundary, ellipseIsClosed, ellipseToPoints, ellipseTransform, ellipsePointAtAngle, ellipseMiddlePoint, ellipseStartPoint, ellipseEndPoint } from "./ellipse.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { shapeLengthFromPoints } from "../shape/shape.function";

export class Ellipse implements EllipseData, Shape {

    type = GeometryTypeEnum.ELLIPSE;
    origin: PointData;
    majorLength: number;
    minorLength: number;
    rotation: number;
    startAngle: number;
    endAngle: number;

    constructor(data: EllipseData) {
        this.origin = data.origin;
        this.majorLength = data.majorLength;
        this.minorLength = data.minorLength;
        this.rotation = data.rotation;
        this.startAngle = data.startAngle;
        this.endAngle = data.endAngle;
    }

    get isClosed(): boolean {
        return ellipseIsClosed(this.startAngle, this.endAngle);
    }

    get boundary(): Boundary {
        return new Boundary(ellipseBoundary(this));
    }

    get startPoint(): Point {
        return new Point(ellipseStartPoint(this));
    }

    get endPoint(): Point {
        return new Point(ellipseEndPoint(this));
    }

    get middlePoint(): Point {
        return new Point(ellipseMiddlePoint(this));
    }

    get area(): number | null {
        if (!this.isClosed) return null;
        // For a closed ellipse, use the formula: π * a * b 
        // where a and b are the semi-major and semi-minor axes
        return Math.PI * (this.majorLength / 2) * (this.minorLength / 2);
    }

    get length(): number {
        // For a full ellipse, use Ramanujan's approximation
        if (this.isClosed) {
            const a = this.majorLength / 2;
            const b = this.minorLength / 2;
            const h = Math.pow((a - b)/(a + b), 2);
            return Math.PI * (a + b) * (1 + (3*h)/(10 + Math.sqrt(4 - 3*h)));
        }
        // For partial ellipse, approximate with points
        return shapeLengthFromPoints(this.tessellate(1000));
    }

    transform(transform: TransformData): void {
        const ellipseData = ellipseTransform(transform, this);
        this.origin.x = ellipseData.origin.x;
        this.origin.y = ellipseData.origin.y;
        this.rotation = ellipseData.rotation;
        this.majorLength = ellipseData.majorLength;
        this.minorLength = ellipseData.minorLength;
        this.startAngle = ellipseData.startAngle;
        this.endAngle = ellipseData.endAngle;
    }

    contains(geometry: Geometry): boolean {
        if (!this.isClosed)
            return false;
        else
            throw new Error("Method not implemented.");
    }

    tessellate(samples: number = 1000): Point[] {
        // HACK one sample per unit length
        samples = this.length
        return ellipseToPoints(this, samples).map(p => new Point(p));
    }

    reverse(): void {
        throw new Error("Method not implemented.");
    }

}