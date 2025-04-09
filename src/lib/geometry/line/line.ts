import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { LineData } from "./line.data";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { lineTransform } from "./line.function";

export class Line implements LineData, Shape {

    type = GeometryTypeEnum.LINE;
    startPoint: Point;
    endPoint: Point;

    constructor(data: LineData) {
        this.startPoint = new Point(data.startPoint);
        this.endPoint = new Point(data.endPoint);
    }

    get isClosed(): boolean {
        return false;
    }

    get boundary(): Boundary {
        return new Boundary({ startPoint: this.startPoint, endPoint: this.endPoint });
    }

    get points(): Point[] {
        return [this.startPoint, this.endPoint];
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

    sample(samples: number = 2): Point[] {
        return [this.startPoint, this.endPoint];
    }

}