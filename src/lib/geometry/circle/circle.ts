import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { CircleData } from "./circle.data";
import type { TransformData } from "../transform/transform.data";
import { circleBoundary, circleEndPoint, circleSample, circleStartPoint, circleTransform } from "./circle.function";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { circleMiddlePoint } from "./circle.function";

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
        return new Point(circleStartPoint(this));
    }

    get endPoint(): Point {
        return new Point(circleEndPoint(this)); 
    }

    get middlePoint(): Point {
        return new Point(circleMiddlePoint(this));
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
        return circleSample(this, samples).map(p => new Point(p));
    }

    reverse(): void {
		// Noop
	}

}