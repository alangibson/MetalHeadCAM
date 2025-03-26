import type { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { SplineData } from "./spline.data";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

export class Spline implements SplineData, Shape {
    
    controlPoints: Point[];

    constructor(data: SplineData) {
        this.controlPoints = data.controlPoints;
    }

    get startPoint(): Point {
        return this.controlPoints[0];
    }

    get endPoint(): Point {
        return this.controlPoints[this.controlPoints.length - 1];
    }

    get points(): Point[] {
        return this.controlPoints;
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

