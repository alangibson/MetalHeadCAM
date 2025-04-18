import type { TransformData } from "../transform/transform.data";
import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { ArcData } from "./arc.data";
import { arcBoundary, arcOrientation, arcEndPoint, arcIsClosed, arcMiddlePoint, arcSample, arcStartPoint, arcTransform } from "./arc.function";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";

export class Arc implements ArcData, Shape {

    type = GeometryTypeEnum.ARC;
    origin: Point;
    radius: number;
    startAngle: number;
    endAngle: number;
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
        return new Point(arcStartPoint(this));
    }

    get endPoint(): Point {
        return new Point(arcEndPoint(this));
    }

    get middlePoint(): Point {
        return new Point(arcMiddlePoint(
            this.origin.x,
            this.origin.y,
            this.radius,
            this.startAngle,
            this.endAngle
        ));
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

    transform(transform: TransformData): void {
        const arcData = arcTransform(transform, this);
        this.origin.x = arcData.origin.x;
        this.origin.y = arcData.origin.y;
        this.radius = arcData.radius;
        this.startAngle = arcData.startAngle;
        this.endAngle = arcData.endAngle;
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
        // Convert to array of points for rendering/calculations
        return arcSample(this, samples).map(p => new Point(p));
    }

    reverse(): void {
        const start_angle = this.startAngle;
        this.startAngle = this.endAngle;
        this.endAngle = start_angle;
        this._orientation = this._orientation == OrientationEnum.CLOCKWISE ? OrientationEnum.COUNTERCLOCKWISE : OrientationEnum.CLOCKWISE;
    }

}