import { Point } from "../point/point";
import type { PointData } from "../point/point.data";
import type { Shape } from "../shape/shape";
import type { EllipseData } from "./ellipse.data";
import { ellipseBoundary, ellipseIsClosed, ellipseToPoints, ellipseTransform, ellipsePointAtAngle } from "./ellipse.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";

export class Ellipse implements EllipseData, Shape {
    
    type = GeometryTypeEnum.ELLIPSE;
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

    get isClosed(): boolean {
        return ellipseIsClosed(this.startAngle, this.endAngle);
    }
    
    get boundary(): Boundary {
        return new Boundary(ellipseBoundary(this));
    }

    get startPoint(): Point {
        return new Point(ellipsePointAtAngle(this, this.startAngle));
    }

    get endPoint(): Point {
        return new Point(ellipsePointAtAngle(this, this.endAngle));
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

    contains(geometry: Geometry): boolean {
        if (! this.isClosed)
            return false;
        else
            throw new Error("Method not implemented.");
    }

    sample(samples: number = 20): Point[] {
        return ellipseToPoints(this, samples).map(p => new Point(p));
    }
}