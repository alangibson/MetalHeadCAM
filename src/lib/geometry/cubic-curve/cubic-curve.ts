import type { Shape } from "../shape/shape";
import type { CubicCurveData } from "./cubic-curve.data";
import { Point } from "../point/point";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { cubicCurveBoundary, cubicCurveIsClosed, cubicCurveMiddlePoint, cubicCurveReverse, cubicCurveSample, cubicCurveTransform } from "./cubic-curve.function";
import { shapeAreaFromPoints, shapeLengthFromPoints } from "../shape/shape.function";

export class CubicCurve implements CubicCurveData, Shape {

    type = GeometryTypeEnum.CUBIC_CURVE;
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
        
    get isClosed(): boolean {
        return cubicCurveIsClosed(this);
    }
    
    get boundary(): Boundary {
        return new Boundary(cubicCurveBoundary(this));
    }

    get points(): Point[] {
        return [this.startPoint, this.control1Point, this.control2Point, this.endPoint];
    }

    get middlePoint(): Point {
        return new Point(cubicCurveMiddlePoint(this));
    }

    get area(): number | null {
        if (!this.isClosed) return null;
        return shapeAreaFromPoints(cubicCurveSample(this, 1000));
    }

    get length(): number {
        return shapeLengthFromPoints(cubicCurveSample(this, 1000));
    }

    transform(transform: TransformData): void {
        const transformed = cubicCurveTransform(transform, this);
        this.startPoint.x = transformed.startPoint.x;
        this.startPoint.y = transformed.startPoint.y;
        this.control1Point.x = transformed.control1Point.x;
        this.control1Point.y = transformed.control1Point.y;
        this.control2Point.x = transformed.control2Point.x;
        this.control2Point.y = transformed.control2Point.y;
        this.endPoint.x = transformed.endPoint.x;
        this.endPoint.y = transformed.endPoint.y;
    }

    contains(geometry: Geometry): boolean {
        if (! this.isClosed)
            return false;
        else
            throw new Error("Method not implemented.");
    }
    
    sample(samples: number = 1000): Point[] {
        // HACK one sample per unit length
        samples = this.length
        return cubicCurveSample(this, samples).map(p => new Point(p));
    }

    reverse() {
		const reversed: CubicCurveData = cubicCurveReverse(this);
		this.startPoint = new Point(reversed.startPoint);
		this.control1Point = new Point(reversed.control1Point);
		this.control2Point = new Point(reversed.control2Point);
		this.endPoint = new Point(reversed.endPoint);
	}

}
