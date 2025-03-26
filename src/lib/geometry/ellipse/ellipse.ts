import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import type { Shape } from "../shape/shape";
import type { EllipseData } from "./ellipse.data";
import { ellipseTransform, getPointAtAngleOnEllipse } from "./ellipse.function";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

export class Ellipse implements EllipseData, Shape {
    
    origin: PointData;
    majorLength: number;
    minorLength: number;
    rotation: number;
    startAngle: number;
    endAngle: number;

    constructor(data: EllipseData) {
        this.origin = data.origin;
        this.majorLength = data.majorLength;
        this.minorLength = data.minorLength;
        this.rotation = data.rotation;
        this.startAngle = data.startAngle;
        this.endAngle = data.endAngle;
    }

    get startPoint(): Point {
        return new Point(getPointAtAngleOnEllipse(
            this.origin,
            this.majorLength,
            this.minorLength,
            this.rotation,
            this.startAngle
        ));
    }

    get endPoint(): Point {
        return new Point(getPointAtAngleOnEllipse(
            this.origin,
            this.majorLength,
            this.minorLength,
            this.rotation,
            this.endAngle
        ));
    }

    transform(transform: TransformData): void {
        const ellipseData = ellipseTransform(transform, this);
        this.origin.x = ellipseData.origin.x;
        this.origin.y = ellipseData.origin.y;
        this.rotation = ellipseData.rotation;
        this.majorLength = ellipseData.majorLength;
        this.minorLength = ellipseData.minorLength;
        this.startAngle = ellipseData.startAngle;
        this.endAngle = ellipseData.endAngle;
    }

}