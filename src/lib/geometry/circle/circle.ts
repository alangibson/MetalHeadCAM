import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { CircleData } from "./circle.data";
import type { TransformData } from "../transform/transform.data";
import { circleTransform } from "./circle.function";

export class Circle implements CircleData, Shape {

    origin: Point;
    radius: number;

    constructor(data: CircleData) {
        this.origin = new Point(data.origin);
        this.radius = data.radius;
    }

    get startPoint(): Point {
        return new Point({
            x: this.origin.x + this.radius,
            y: this.origin.y
        });
    }

    get endPoint(): Point {
        return new Point({
            x: this.origin.x + this.radius,
            y: this.origin.y
        }); 
    }

    transform(transform: TransformData): void {
        const circleData = circleTransform(transform, this);
        this.origin.x = circleData.x;
        this.origin.y = circleData.y;
        this.radius = circleData.radius;
    }
}