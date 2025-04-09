import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import type { Shape } from "../shape/shape";
import type { QuadraticCurveData } from "./quadratic-curve.data";
import type { TransformData } from "../transform/transform.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { quadraticCurveBoundary, quadraticCurveIsClosed, quadraticCurveSample, quadraticCurveTransform } from "./quadratic-curve.function";

export class QuadraticCurve implements QuadraticCurveData, Shape {
    
    type = GeometryTypeEnum.QUADRATIC_CURVE;
    startPoint: Point;
    controlPoint: Point;
    endPoint: Point;

    constructor(data: QuadraticCurveData) {
        this.startPoint = new Point(data.startPoint);
        this.controlPoint = new Point(data.controlPoint);
        this.endPoint = new Point(data.endPoint);
    }

    get isClosed(): boolean {
        return quadraticCurveIsClosed(this);
    }
    
    get boundary(): Boundary {
        return new Boundary(quadraticCurveBoundary(this));
    }

    get points(): Point[] {
        return [this.startPoint, this.controlPoint, this.endPoint];
    }

    transform(transform: TransformData): void {
        const transformed = quadraticCurveTransform(transform, this);
        this.startPoint.x = transformed.startPoint.x;
        this.startPoint.y = transformed.startPoint.y;
        this.controlPoint.x = transformed.controlPoint.x;
        this.controlPoint.y = transformed.controlPoint.y;
        this.endPoint.x = transformed.endPoint.x;
        this.endPoint.y = transformed.endPoint.y;
    }

    contains(geometry: Geometry): boolean {
        if (! this.isClosed)
            return false;
        else
            throw new Error("Method not implemented.");
    }

    sample(samples: number = 20): Point[] {
        return quadraticCurveSample(this, samples).map(data => new Point(data));
    }
}