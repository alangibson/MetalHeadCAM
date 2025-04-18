import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { LineData } from "./line.data";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { lineMiddlePoint, lineOrientation, lineSample, lineTransform } from "./line.function";

export class Line implements LineData, Shape {

    type = GeometryTypeEnum.LINE;
    startPoint: Point;
    endPoint: Point;
    private _orientation?: OrientationEnum;

    constructor(data: LineData) {
        this.startPoint = new Point(data.startPoint);
        this.endPoint = new Point(data.endPoint);
    }

    get isClosed(): boolean {
        return false;
    }

    get orientation(): OrientationEnum {
        if (! this._orientation)
            this._orientation = lineOrientation(this.startPoint, this.endPoint);
        return this._orientation;
    }

    get boundary(): Boundary {
        return new Boundary({ startPoint: this.startPoint, endPoint: this.endPoint });
    }

    get points(): Point[] {
        return [this.startPoint, this.endPoint];
    }

    get middlePoint(): Point {
        return new Point(lineMiddlePoint(this));
    }

    get area(): number | null {
        // A line is never closed
        return null;
    }

    get length(): number {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    transform(transform: TransformData): void {
        const transformed = lineTransform(transform, this);
        this.startPoint.x = transformed.startPoint.x;
        this.startPoint.y = transformed.startPoint.y;
        this.endPoint.x = transformed.endPoint.x;
        this.endPoint.y = transformed.endPoint.y;
    }

    contains(geometry: Geometry): boolean {
        return false;
    }

    tessellate(samples: number = 1000): Point[] {
        // HACK one sample per unit length
        samples = this.length
        return lineSample(this, samples).map(p => new Point(p));
    }

    reverse(): void {
		const startPoint = this.startPoint;
		this.startPoint = this.endPoint;
		this.endPoint = startPoint;
        this._orientation = this._orientation == OrientationEnum.CLOCKWISE ? OrientationEnum.COUNTERCLOCKWISE : OrientationEnum.CLOCKWISE;
	}

}