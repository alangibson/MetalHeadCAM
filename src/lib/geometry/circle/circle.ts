import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import type { Shape } from "../shape/shape";
import type { CircleData } from "./circle.data";
import { circleBoundary, circleStartPoint, circleEndPoint, circleTransform, circleMiddlePoint, circleTessellate } from "./circle.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import type { AngleRadians } from "../angle/angle.type";
import { angleBetweenPoints } from "../angle/angle.function";

export class Circle implements CircleData, Shape {

    type = GeometryTypeEnum.CIRCLE;
    origin: Point;
    radius: number;
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

    transform(transform: TransformData): void {
        const circleData = circleTransform(transform, this);
        this.origin.x = circleData.origin.x;
        this.origin.y = circleData.origin.y;
        this.radius = circleData.radius;
    }

    contains(geometry: Geometry): boolean {
        throw new Error("Method not implemented.");
    }
    
    tessellate(samples: number = 1000): Point[] {
        // HACK one sample per unit length
        samples = this.length
        const sample = circleTessellate(this, samples).map(p => new Point(p));
        return [this.startPoint, ...sample, this.endPoint];
    }

    reverse(): void {
		// Noop
	}

    bearingAt(point: PointData): AngleRadians {
        // Calculate the angle from the center to the point
        const angle = angleBetweenPoints(this.origin, point);
        // The tangent is perpendicular to the radius
        return angle + Math.PI / 2;
    }

}