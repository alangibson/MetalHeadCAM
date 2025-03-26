import type { Shape } from "../shape/shape";
import type { PointData } from "../point/point.data";
import type { CubicCurveData } from "./cubic-curve.data";
import { Point } from "../point/point";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

export class CubicCurve implements Shape {

    startPoint: Point;
    control1Point: Point;
    control2Point: Point;
    endPoint: Point;

    constructor(data: CubicCurveData) {
        this.startPoint = new Point(data.startPoint);
        this.control1Point = new Point(data.control1Point);
        this.control2Point = new Point(data.control2Point);
        this.endPoint = new Point(data.endPoint);
    }

    get points(): Point[] {
        return [this.startPoint, this.control1Point, this.control2Point, this.endPoint];
    }

    transform(transform: TransformData): void {
        const matrix = compose(
            translate(transform.translateX || 0, transform.translateY || 0),
            rotate(transform.rotateAngle || 0),
            scale(transform.scaleX || 1, transform.scaleY || 1)
        )
        this.points.forEach(point => {
            const newPoint = applyToPoint(matrix, point);
            point.x = newPoint.x;
            point.y = newPoint.y;
        });
    }

}
