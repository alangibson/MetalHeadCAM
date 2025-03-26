import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import type { Shape } from "../shape/shape";
import type { QuadraticCurveData } from "./quadratic-curve.data";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

export class QuadraticCurve implements QuadraticCurveData, Shape {
    
    startPoint: Point;
    controlPoint: Point;
    endPoint: Point;

    constructor(data: QuadraticCurveData) {
        this.startPoint = new Point(data.startPoint);
        this.controlPoint = new Point(data.controlPoint);
        this.endPoint = new Point(data.endPoint);
    }

    get points(): Point[] {
        return [this.startPoint, this.controlPoint, this.endPoint];
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