import verb from 'verb-nurbs';
import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { SplineData } from "./spline.data";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { splineBoundary, splineIsClosed, splineSample, splineTransform, splineMiddlePoint, splineStartPoint, splineEndPoint } from "./spline.function";
import { shapeAreaFromPoints, shapeLengthFromPoints } from "../shape/shape.function";

/**
 * A NURBS.
 */
export class Spline implements SplineData, Shape {

    type = GeometryTypeEnum.SPLINE;
    controlPoints: Point[];
    _knots: number[] | undefined;
    _weights: number[] | undefined;
    _degree: number | undefined;

    constructor(data: SplineData) {
        this.controlPoints = data.controlPoints.map(p => new Point(p));
        this._knots = data.knots;
        this._weights = data.weights;
        this._degree = data.degree;

        // Validate
        if (this._degree && this._knots) {
            const expectedKnotCount = this.controlPoints.length + this._degree + 1;
            if (this._knots.length !== expectedKnotCount) {
                console.warn(
                    `Spline knot count mismatch: Expected ${expectedKnotCount} (ControlPoints=${this.controlPoints.length} + Degree=${this._degree} + 1), but found ${this._knots.length}. The spline definition might be non-standard or clamp differently.`
                );
            }
        }
    }

    get degree(): number {
        if (!this._degree)
            this._degree = this.controlPoints.length - 1;
        return this._degree;
    }

    get knots(): number[] {
        if (!this._knots)
            this._knots = Array(this.degree + 1)
                .fill(0)
                .concat(Array(this.degree + 1).fill(1));
        return this._knots;
    }

    get weights(): number[] {
        if (!this._weights)
            this._weights = Array(this.controlPoints.length).fill(1);
        return this._weights;
    }

    get isClosed(): boolean {
        return splineIsClosed(this);
    }

    get boundary(): Boundary {
        return new Boundary(splineBoundary(this));
    }

    get startPoint(): Point {
        return new Point(splineStartPoint(this));
    }

    get endPoint(): Point {
        return new Point(splineEndPoint(this));
    }

    get middlePoint(): Point {
        return new Point(splineMiddlePoint(this));
    }

    get area(): number | null {
        if (!this.isClosed) return null;
        return shapeAreaFromPoints(splineSample(this, 1000));
    }

    get length(): number {
        return shapeLengthFromPoints(splineSample(this, 1000));
    }

    clearCache(): void {
        // TODO if knots or weights were set by constructor, they should not be cleared
        this._knots = undefined;
        this._degree = undefined;
        this._weights = undefined;
    }

    transform(transform: TransformData): void {
        const transformed = splineTransform(transform, this);
        this.controlPoints.forEach((point, i) => {
            point.x = transformed.controlPoints[i].x;
            point.y = transformed.controlPoints[i].y;
        });
    }

    contains(geometry: Geometry): boolean {
        if (!this.isClosed)
            return false;
        else
            throw new Error("Method not implemented.");
    }

    tessellate(samples: number = 1000): Point[] {
        // HACK 10 samples per unit length
        samples = this.length * 10;
        return splineSample(this, samples).map(p => new Point(p));
    }

    reverse(): void {
        this.controlPoints.reverse();
        this.knots.reverse();
        this.weights.reverse();
        // this.clearCache();
    }

    /** Decompose NURBS into one or more cubic bezier curves */
    decompose(): Spline[] {
        const nurbsCurve = new verb.geom.NurbsCurve.byKnotsControlPointsWeights(
            this.degree,
            this.knots,
            this.controlPoints.map((point: PointData) => [
                point.x,
                point.y,
                0,
            ]),
            this.weights,
        );
        // cubicCurves is an array of verb.core.NurbsCurveData
        const componentCurves: [] = verb.eval.Modify.decomposeCurveIntoBeziers(
            nurbsCurve.asNurbs(),
        );
        return componentCurves.map(verbNurbsCurveData => {
            return new Spline({
                degree: verbNurbsCurveData.degree,
                controlPoints: verbNurbsCurveData.controlPoints.map(p => new Point({x: p[0], y: p[1]})),
                knots: verbNurbsCurveData.knots
            })            
        });
    }

}

