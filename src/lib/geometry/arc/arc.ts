import type { TransformData } from "../transform/transform.data";
import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { ArcData } from "./arc.data";
import { ArcDirectionEnum } from "./arc.enum";
import { arcBoundary, arcDirection, arcIsClosed, arcMiddlePoint, arcSample, arcTransform } from "./arc.function";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { shapeAreaFromPoints } from "../shape/shape.function";

export class Arc implements ArcData, Shape {

    type = GeometryTypeEnum.ARC;
    origin: Point;
    radius: number; 
    startAngle: number;
    endAngle: number;
    _direction?: ArcDirectionEnum;
    
    constructor(data: ArcData) {
        this.origin = new Point(data.origin);
        this.radius = data.radius;
        this.startAngle = data.startAngle;
        this.endAngle = data.endAngle;
        this._direction = data.direction;
    }

    get isClosed(): boolean {
        return arcIsClosed(this);
    }

    get boundary(): Boundary {
        return new Boundary(arcBoundary(
            this.origin.x,
            this.origin.y,
            this.radius,
            this.startAngle,
            this.endAngle
        ));
    }

    get startPoint(): Point {
        return new Point({
            x: this.origin.x + this.radius * Math.cos(this.startAngle),
            y: this.origin.y + this.radius * Math.sin(this.startAngle)
        });
    }

    get endPoint(): Point {
        return new Point({
            x: this.origin.x + this.radius * Math.cos(this.endAngle),
            y: this.origin.y + this.radius * Math.sin(this.endAngle)
        });
    }

	get middlePoint(): Point {
		const { x, y } = arcMiddlePoint(
			this.origin.x,
			this.origin.y,
			this.radius,
			this.startAngle,
			this.endAngle
		);
		return new Point({ x, y });
	}

    get direction(): ArcDirectionEnum {
        if (this._direction)
            return this._direction;
        else
            return arcDirection(this.startAngle, this.endAngle);
    }

    get area(): number | null {
        if (!this.isClosed) return null;
        // A closed arc is a circle
        return Math.PI * this.radius * this.radius;
    }

    get length(): number {
        // For an arc, length = radius * angle
        const angle = this.endAngle - this.startAngle;
        return Math.abs(this.radius * angle);
    }

    transform(transform: TransformData): void {
        const arcData = arcTransform(transform, this);
        this.origin.x = arcData.origin.x;
        this.origin.y = arcData.origin.y;
        this.radius = arcData.radius;
        this.startAngle = arcData.startAngle;
        this.endAngle = arcData.endAngle;
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
        // Convert to array of points for rendering/calculations
        return arcSample(this, samples).map(p => new Point(p));
    }

	reverse(): void {
		const start_angle = this.startAngle;
		this.startAngle = this.endAngle;
		this.endAngle = start_angle;
		this._direction = this._direction == ArcDirectionEnum.CW ? ArcDirectionEnum.CCW : ArcDirectionEnum.CW;
	}

}