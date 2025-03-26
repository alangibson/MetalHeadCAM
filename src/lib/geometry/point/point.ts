import type { Geometry } from "../geometry/geometry";
import type { TransformData } from "../transform/transform.data";
import type { PointData } from "./point.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

export class Point implements PointData, Geometry {

    x: number;
    y: number;

    constructor(props: PointData) {
        this.x = props.x;
        this.y = props.y;
    }

    /**
     * Points are the same within a given tolerance.
     */
    coincident(thatPoint: Point, tolerance: number = 0.005): boolean {
        return Math.abs(this.x - thatPoint.x) < tolerance && Math.abs(this.y - thatPoint.y) < tolerance;
    }

    transform(transform: TransformData): void {
        const matrix = compose(
            translate(transform.translateX || 0, transform.translateY || 0),
            rotate(transform.rotateAngle || 0),
            scale(transform.scaleX || 1, transform.scaleY || 1)
        );
        const newPoint = applyToPoint(matrix, this);
        this.x = newPoint.x;
        this.y = newPoint.y;
    }

}