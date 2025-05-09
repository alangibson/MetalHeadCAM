import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import type { Shape } from "../shape/shape";
import type { CircleData } from "./circle.data";
import { circleBoundary, circleStartPoint, circleEndPoint, circleTransform, circleMiddlePoint, circleTessellate, circleTangentAt } from "./circle.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import type { AngleRadians } from "../angle/angle.type";
import { angleBetweenPoints } from "../angle/angle.function";

export class Circle implements CircleData, Shape {

    type = GeometryTypeEnum.CIRCLE;
    // Definition of this shape
    origin: Point;
    radius: number;
    // Cache
    private _startPoint?: Point;
    private _middlePoint?: Point;
    private _endPoint?: Point;
    private _orientation: OrientationEnum = OrientationEnum.CLOCKWISE;

    constructor(data: CircleData) {
        this.origin = new Point(data.origin);
        this.radius = data.radius;
    }
    
    get isClosed(): boolean {
        return true;
    }

    get orientation(): OrientationEnum {
        return this._orientation;
    }

    get boundary(): Boundary {
        return new Boundary(circleBoundary(this));
    }

    get startPoint(): Point {
        if (!this._startPoint)
            this._startPoint = new Point(circleStartPoint(this));
        return this._startPoint;
    }

    set startPoint(point: Point) {
        this._startPoint = point;
    }

    get middlePoint(): Point {
        if (!this._middlePoint)
            this._middlePoint = new Point(circleMiddlePoint(this));
        return this._middlePoint;
    }

    get endPoint(): Point {
        if (!this._endPoint)
            this._endPoint = new Point(circleEndPoint(this));
        return this._endPoint;
    }

    set endPoint(point: Point) {
        this._endPoint = point;
    }

    get area(): number | null {
        return Math.PI * this.radius * this.radius;
    }

    get length(): number {
        return 2 * Math.PI * this.radius;
    }
    
    clearCache(): void {
        this._startPoint = undefined;
        this._middlePoint = undefined;
        this._endPoint = undefined;
    }

    transform(transform: TransformData): void {
        const circleData = circleTransform(transform, this);
        this.origin.x = circleData.origin.x;
        this.origin.y = circleData.origin.y;
        this.radius = circleData.radius;
        this.clearCache();
    }

    contains(geometry: Geometry): boolean {
        throw new Error("Method not implemented.");
    }
    
    tessellate(samples?: number): Point[] {
        if (! samples)
            samples = this.length;
        const sample = circleTessellate(this, samples).map(p => new Point(p));
        return [this.startPoint, ...sample, this.endPoint];
    }

    reverse(): void {
		// Noop
	}

    tangentAt(point: PointData): AngleRadians {
        return circleTangentAt(this, point);
    }

    clone(): Circle {
        return new Circle({
            origin: this.origin.clone(),
            radius: this.radius
        });
    }

    offset(distance: number): void {
        const newRadius = this.radius + distance;
        if (newRadius < 0) {
            throw new Error("Offset distance would result in a negative radius");
        }
        this.radius = newRadius;
        this.clearCache();
    }
}