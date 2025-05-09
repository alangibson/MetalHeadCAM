import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import type { Shape } from "../shape/shape";
import type { EllipseData } from "./ellipse.data";
import { ellipseBoundary, ellipseIsClosed, ellipseTessellate, ellipseTransform, ellipsePointAtAngle, ellipseMiddlePoint, ellipseStartPoint, ellipseEndPoint, ellipseOrientation, ellipseTangentAt } from "./ellipse.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { shapeLengthFromPoints } from "../shape/shape.function";
import type { AngleRadians } from "../angle/angle.type";
import { angleBetweenPoints } from "../angle/angle.function";

export class Ellipse implements EllipseData, Shape {

    type = GeometryTypeEnum.ELLIPSE;
    origin: PointData;
    majorLength: number;
    minorLength: number;
    rotation: number;
    startAngle: number;
    endAngle: number;
    private _orientation?: OrientationEnum;
    private _startPoint?: Point;
    private _middlePoint?: Point;
    private _endPoint?: Point;

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

    get orientation(): OrientationEnum {
        if (!this._orientation) {
            this._orientation = ellipseOrientation(this.startAngle, this.endAngle);
        }
        return this._orientation;
    }

    get boundary(): Boundary {
        return new Boundary(ellipseBoundary(this));
    }

    get startPoint(): Point {
        if (!this._startPoint)
            this._startPoint = new Point(ellipseStartPoint(this));
        return this._startPoint;
    }

    get endPoint(): Point {
        if (!this._endPoint)
            this._endPoint = new Point(ellipseEndPoint(this));
        return this._endPoint;
    }

    get middlePoint(): Point {
        if (!this._middlePoint)
            this._middlePoint = new Point(ellipseMiddlePoint(this));
        return this._middlePoint;
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
        return shapeLengthFromPoints(this.tessellate());
    }

    clearCache(): void {
        this._startPoint = undefined;
        this._middlePoint = undefined;
        this._endPoint = undefined;
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
        this.clearCache();
    }

    contains(geometry: Geometry): boolean {
        if (!this.isClosed)
            return false;
        else
            throw new Error("Method not implemented.");
    }

    tangentAt(point: PointData): AngleRadians {
        return ellipseTangentAt(this, point);
    }

    tessellate(samples?: number): Point[] {
        if (! samples)
            samples = this.length;
        const sample = ellipseTessellate(this, samples).map(p => new Point(p));
        return [this.startPoint, ...sample, this.endPoint];
    }

    reverse(): void {
        throw new Error("Method not implemented.");
    }

    clone(): Ellipse {
        return new Ellipse({
            origin: JSON.parse(JSON.stringify(this.origin)),
            majorLength: this.majorLength,
            minorLength: this.minorLength,
            rotation: this.rotation,
            startAngle: this.startAngle,
            endAngle: this.endAngle
        });
    }

    offset(distance: number): void {
        const newMajorLength = this.majorLength + distance;
        const newMinorLength = this.minorLength + distance;
        if (newMajorLength < 0 || newMinorLength < 0) {
            throw new Error("Offset distance would result in a negative major or minor length");
        }
        this.majorLength = newMajorLength;
        this.minorLength = newMinorLength;
        this.clearCache();
    }

}