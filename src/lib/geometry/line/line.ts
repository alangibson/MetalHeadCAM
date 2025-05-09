import { Point } from "../point/point";
import { Shape } from "../shape/shape";
import type { LineData } from "./line.data";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum, OrientationEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { lineIsClosed, lineMiddlePoint, lineOrientation, lineTessellate, lineTransform } from "./line.function";
import type { AngleRadians } from "../angle/angle.type";
import type { PointData } from "../point/point.data";
import { angleBetweenPoints } from "../angle/angle.function";

export class Line extends Shape implements LineData {

    type = GeometryTypeEnum.LINE;
    startPoint: Point;
    endPoint: Point;
    private _orientation?: OrientationEnum;
    private _middlePoint?: Point;

    constructor(data: LineData) {
        super();
        this.startPoint = new Point(data.startPoint);
        this.endPoint = new Point(data.endPoint);

        // Validate
        // Shouldn't be possible for start and end points to be identical
        if (this.startPoint.coincident(this.endPoint, 0))
            console.warn('Line start and end points are identical', this);
    }

    get isClosed(): boolean {
        return lineIsClosed(this);
    }

    get orientation(): OrientationEnum {
        if (! this._orientation)
            this._orientation = lineOrientation(this.startPoint, this.endPoint);
        return this._orientation;
    }

    get boundary(): Boundary {
        return new Boundary({ startPoint: this.startPoint, endPoint: this.endPoint });
    }

    get points(): Point[] {
        return [this.startPoint, this.endPoint];
    }

    get middlePoint(): Point {
        if (!this._middlePoint)
            this._middlePoint = new Point(lineMiddlePoint(this));
        return this._middlePoint;
    }

    get area(): number | null {
        // A line is never closed
        return null;
    }

    get length(): number {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    clearCache(): void {
        this._middlePoint = undefined;
    }

    transform(transform: TransformData): void {
        const transformed = lineTransform(transform, this);
        this.startPoint.x = transformed.startPoint.x;
        this.startPoint.y = transformed.startPoint.y;
        this.endPoint.x = transformed.endPoint.x;
        this.endPoint.y = transformed.endPoint.y;
        this.clearCache();
    }

    contains(geometry: Geometry): boolean {
        return false;
    }

    tessellate(samples?: number): Point[] {
        if (! samples)
            samples = this.length;
        const lineSamples = lineTessellate(this, samples);
        const sample = lineSamples.map(p => new Point(p));
        return [this.startPoint, ...sample, this.endPoint];
    }

    reverse(): void {
		const startPoint = this.startPoint;
		this.startPoint = this.endPoint;
		this.endPoint = startPoint;
        this._orientation = this._orientation == OrientationEnum.CLOCKWISE ? OrientationEnum.COUNTERCLOCKWISE : OrientationEnum.CLOCKWISE;
	}

    tangentAt(point: PointData): AngleRadians {
        return angleBetweenPoints(this.startPoint, this.endPoint);
    }

    clone(): Line {
        return new Line({
            startPoint: this.startPoint.clone(),
            endPoint: this.endPoint.clone()
        });
    }

    offset(distance: number): void {
        // Calculate perpendicular vector
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and rotate 90 degrees
        const perpX = -dy / length;
        const perpY = dx / length;
        
        // Apply offset
        this.startPoint.x += perpX * distance;
        this.startPoint.y += perpY * distance;
        this.endPoint.x += perpX * distance;
        this.endPoint.y += perpY * distance;
        
        this.clearCache();
    }

}