import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { CircleData } from "./circle.data";
import type { TransformData } from "../transform/transform.data";
import { circleBoundary, circleSample, circleTransform } from "./circle.function";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";

export class Circle implements CircleData, Shape {

    type = GeometryTypeEnum.CIRCLE;
    origin: Point;
    radius: number;

    constructor(data: CircleData) {
        this.origin = new Point(data.origin);
        this.radius = data.radius;
    }
    
    get isClosed(): boolean {
        return true;
    }

    get boundary(): Boundary {
        return new Boundary(circleBoundary(this));
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
        this.origin.x = circleData.origin.x;
        this.origin.y = circleData.origin.y;
        this.radius = circleData.radius;
    }

    contains(geometry: Geometry): boolean {
        throw new Error("Method not implemented.");
    }
    
    sample(samples: number = 20): Point[] {
        return circleSample(this, samples).map(p => new Point(p));
    }

}