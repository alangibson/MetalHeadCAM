import type { TransformData } from "../transform/transform.data";
import { Point } from "../point/point";
import type { BooleanOperationEnum, Shape } from "../shape/shape";
import type { ArcData } from "./arc.data";
import { arcBoundary, arcOrientation, arcEndPoint, arcIsClosed, arcMiddlePoint, arcTessellate, arcStartPoint, arcTransform, arcTangentAt } from "./arc.function";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import type { PointData } from "../point/point.data";
import type { AngleRadians } from "../angle/angle.type";
import { tangentIntersection } from "../geometry/geometry.function";

export class Arc implements ArcData, Shape {

    type = GeometryTypeEnum.ARC;
    origin: Point;
    radius: number;
    startAngle: number;
    endAngle: number;
    private _startPoint?: Point;
    private _middlePoint?: Point;
    private _endPoint?: Point;
    private _orientation?: OrientationEnum;

    constructor(data: ArcData) {
        this.origin = new Point(data.origin);
        this.radius = data.radius;
        this.startAngle = data.startAngle;
        this.endAngle = data.endAngle;
        if (data.orientation)
            this._orientation = data.orientation;
        else
            // Set at creation time because we will render arc backwards
            // if we reverse() then try to determine direction afterward
            this._orientation = OrientationEnum.COUNTERCLOCKWISE;
    }

    get isClosed(): boolean {
        return arcIsClosed(this);
    }

    get boundary(): Boundary {
        return new Boundary(arcBoundary(
            this.origin.x,
            this.origin.y,
            this.radius,
            this.startAngle,
            this.endAngle
        ));
    }

    get startPoint(): Point {
        if (! this._startPoint)
            this._startPoint = new Point(arcStartPoint(this))
        return this._startPoint;
    }

    set startPoint(point: Point) {
        this._startPoint = point;
    }

    get endPoint(): Point {
        if (! this._endPoint)
            this._endPoint = new Point(arcEndPoint(this))
        return this._endPoint;
    }

    set endPoint(point: Point) {
        this._endPoint = point;
    }

    get middlePoint(): Point {
        if (! this._middlePoint)
            this._middlePoint = new Point(arcMiddlePoint(this))
        return this._middlePoint;
    }

    get orientation(): OrientationEnum {
        if (this._orientation)
            return this._orientation;
        else
            return arcOrientation(this.startAngle, this.endAngle);
    }

    get area(): number | null {
        if (!this.isClosed) return null;
        // A closed arc is a circle
        return Math.PI * this.radius * this.radius;
    }

    get length(): number {
        // For an arc, length = radius * angle
        const angle = this.endAngle - this.startAngle;
        return Math.abs(this.radius * angle);
    }

    // Sweep of the arc angle
    get angle(): AngleRadians {
        return this.endAngle - this.startAngle;
        
    }

    // Rotation of the angle from 0
    get rotation(): AngleRadians {
        return this.startAngle;
    }

    clearCache(): void {
        this._startPoint = undefined;
        this._middlePoint = undefined;
        this._endPoint = undefined;
    }

    transform(transform: TransformData): void {
        const arcData = arcTransform(transform, this);
        this.origin.x = arcData.origin.x;
        this.origin.y = arcData.origin.y;
        this.radius = arcData.radius;
        this.startAngle = arcData.startAngle;
        this.endAngle = arcData.endAngle;
        this.clearCache();
    }

    contains(geometry: Geometry): boolean {
        if (!this.isClosed)
            return false;
        else
            throw new Error("Method not implemented.");
    }

    tessellate(samples?: number): Point[] {
        if (! samples)
            samples = this.length;
        // Convert to array of points for rendering/calculations
        const sample = arcTessellate(this, samples).map(p => new Point(p));
        return [this.startPoint, ...sample, this.endPoint];
    }

    reverse(): void {
        const start_angle = this.startAngle;
        this.startAngle = this.endAngle;
        this.endAngle = start_angle;
        this._orientation = this._orientation == OrientationEnum.CLOCKWISE ? OrientationEnum.COUNTERCLOCKWISE : OrientationEnum.CLOCKWISE;
        this.clearCache();
    }

    tangentAt(point: PointData): AngleRadians {
        return arcTangentAt(this, point);
    }

    clone(): Arc {
        return new Arc({
            origin: this.origin.clone(),
            radius: this.radius,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            orientation: this.orientation
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


