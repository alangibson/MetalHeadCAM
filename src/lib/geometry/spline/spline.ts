import verb from 'verb-nurbs';
import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { SplineData } from "./spline.data";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { splineBoundary, splineIsClosed, splineTessellate, splineTransform, splineMiddlePoint, splineStartPoint, splineEndPoint, splineOrientation, splineIsClamped } from "./spline.function";
import { shapeAreaFromPoints, shapeLengthFromPoints } from "../shape/shape.function";
import type { PointData } from "../point/point.data";
import type { AngleRadians } from "../angle/angle.type";
import nurbs from 'nurbs';
import { splineTangentAt } from "./spline.function";

/**
 * A NURBS.
 */
export class Spline implements SplineData, Shape {

    type = GeometryTypeEnum.SPLINE;
    controlPoints: Point[];
    private _knots?: number[];
    private _weights?: number[];
    private _degree?: number;
    private _orientation?: OrientationEnum;
    private _startPoint?: Point;
    private _middlePoint?: Point;
    private _endPoint?: Point;

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
    
    get orientation(): OrientationEnum {
        if (! this._orientation)
            this._orientation = splineOrientation(this);
        return this._orientation;
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

    /** True if curve runs through start and end points */
    get isClamped(): boolean {
        return splineIsClamped(this);
    }

    get boundary(): Boundary {
        return new Boundary(splineBoundary(this));
    }

    get startPoint(): Point {
        if (!this._startPoint)
            this._startPoint = new Point(splineStartPoint(this));
        return this._startPoint;
    }

    set startPoint(point: Point) {
        this.controlPoints[0] = point;
        this._startPoint = undefined;
    }

    get endPoint(): Point {
        if (!this._endPoint)
            this._endPoint = new Point(splineEndPoint(this));
        return this._endPoint;
    }

    set endPoint(point: Point) {
        this.controlPoints[this.controlPoints.length-1] = point;
        this._endPoint = undefined;
    }

    get middlePoint(): Point {
        if (!this._middlePoint)
            this._middlePoint = new Point(splineMiddlePoint(this));
        return this._middlePoint;
    }

    get area(): number | null {
        if (!this.isClosed) return null;
        return shapeAreaFromPoints(splineTessellate(this, 1000));
    }

    get length(): number {
        return shapeLengthFromPoints(splineTessellate(this, 1000));
    }

    clearCache(): void {
        this._startPoint = undefined;
        this._endPoint = undefined;
        // TODO if knots or weights were set by constructor, they should not be cleared
        this._knots = undefined;
        this._degree = undefined;
        this._weights = undefined;
        this._orientation = undefined;
    }

    transform(transform: TransformData): void {
        const transformed = splineTransform(transform, this);
        this.controlPoints.forEach((point, i) => {
            point.x = transformed.controlPoints[i].x;
            point.y = transformed.controlPoints[i].y;
        });
        this.clearCache();
    }

    contains(geometry: Geometry): boolean {
        if (!this.isClosed)
            return false;
        else
            throw new Error("Method not implemented.");
    }

    tessellate(samples?: number): Point[] {
        if (! samples)
            samples = this.length * 10;
        const sample = splineTessellate(this, samples).map(p => new Point(p));
        return [this.startPoint, ...sample, this.endPoint];
    }

    reverse(): void {
        this.controlPoints.reverse();
        this.knots.reverse();
        this.weights.reverse();
        // this.clearCache();
        // this._startPoint = undefined;
        // this._middlePoint = undefined;
        // this._endPoint = undefined;
    }

    tangentAt(point: PointData): AngleRadians {
        return splineTangentAt(this, point);
    }

    /** Calculate the normal vector at a point on the spline */
    normalAt(point: PointData): { x: number, y: number } {
        const tangent = this.tangentAt(point);
        return {
            x: -Math.sin(tangent),
            y: Math.cos(tangent)
        };
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

    clone(): Spline {
        return new Spline({
            controlPoints: this.controlPoints.map(point => point.clone()),
            knots: this.knots,
            weights: this.weights,
            degree: this.degree
        });
    }

    offset(distance: number): void {
        // Create a parallel curve by offsetting the control points
        // and adjusting weights to maintain shape
        const newControlPoints: Point[] = [];
        const newWeights: number[] = [];
        
        // For each control point, calculate the offset direction
        for (let i = 0; i < this.controlPoints.length; i++) {
            const point = this.controlPoints[i];
            const weight = this.weights[i];
            
            // Calculate normal vector at this control point
            const normal = this.normalAt(point);
            
            // Offset the control point along the normal
            newControlPoints.push(new Point({
                x: point.x + distance * normal.x,
                y: point.y + distance * normal.y
            }));
            
            // Adjust weight to maintain shape
            // For parallel curves, weights need to be adjusted based on distance
            const adjustedWeight = weight * (1 + distance * Math.abs(Math.cos(this.tangentAt(point))));
            newWeights.push(adjustedWeight);
        }

        // 
        // test fitting to original curve
        //

        // Test fitting by sampling points along both curves and comparing distances
        const samples = 100;
        // Maximum allowed deviation in units
        const maxError = 0.01; 
        
        // Sample points along original curve
        const originalPoints = this.tessellate(samples);
        
        // Create temporary spline with new control points
        const tempSpline = new Spline({
            controlPoints: newControlPoints,
            knots: this.knots,
            weights: newWeights,
            degree: this.degree
        });
        
        // Sample points along new curve
        const newPoints = tempSpline.tessellate(samples);
        
        // Compare corresponding points
        let maxDeviation = 0;
        for (let i = 0; i < newPoints.length; i++) {
            const originalPoint = originalPoints[i];
            const newPoint = newPoints[i];
            const distance = Math.sqrt(
                Math.pow(originalPoint.x - newPoint.x, 2) + 
                Math.pow(originalPoint.y - newPoint.y, 2)
            );
            maxDeviation = Math.max(maxDeviation, distance);
        }
        
        // If deviation is too large, adjust weights
        // Adding half of distance because it should deviate by exactly that much
        const perfectDeviation = Math.abs(distance);
        const actualDeviation = Math.abs(maxDeviation - perfectDeviation);
        console.log('deviation max', maxDeviation, 'perfect', perfectDeviation, 'actual', actualDeviation);
        if (actualDeviation > maxError) {
            console.warn(`Spline offset deviation too large: ${actualDeviation.toFixed(3)} units`);
            // Adjust weights to improve fit
            for (let i = 0; i < newWeights.length; i++) {
                newWeights[i] *= (1 - maxDeviation / (2 * distance));
            }
        }
        
        // 
        // Save results
        //

        // Update the spline with new control points and weights
        this.controlPoints = newControlPoints;
        this._weights = newWeights;
        
        // Clear cached values
        this.clearCache();
    }

}

