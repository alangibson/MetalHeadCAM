import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { SplineData } from "./spline.data";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { splineBoundary, splineIsClosed, splineSample, splineTransform } from "./spline.function";

/**
 * A NURBS.
 */
export class Spline implements SplineData, Shape {
    
    type = GeometryTypeEnum.SPLINE;
    controlPoints: Point[];

    constructor(data: SplineData) {
        this.controlPoints = data.controlPoints.map(p => new Point(p));
    }

    get isClosed(): boolean {
        return splineIsClosed(this);
    }

    get boundary(): Boundary {
        return new Boundary(splineBoundary(this));
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
        const transformed = splineTransform(transform, this);
        this.controlPoints.forEach((point, i) => {
            point.x = transformed.controlPoints[i].x;
            point.y = transformed.controlPoints[i].y;
        });
    }

    contains(geometry: Geometry): boolean {
        if (! this.isClosed)
            return false;
        else
            throw new Error("Method not implemented.");
    }

    sample(samples: number = 100): Point[] {
        return splineSample(this, samples).map(p => new Point(p));
    }

}

