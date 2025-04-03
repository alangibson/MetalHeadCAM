import type { TransformData } from "../transform/transform.data";
import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { ArcData } from "./arc.data";
import type { ArcDirectionEnum } from "./arc.enum";
import { arcDirection, arcTransform } from "./arc.function";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

export class Arc implements ArcData, Shape {

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

    get direction(): ArcDirectionEnum {
        if (this._direction)
            return this._direction;
        else
            return arcDirection(this.startAngle, this.endAngle);
    }

    // transform(transform: TransformData): void {
    //     // Create transformation matrix
    //     const matrix = compose(
    //         translate(transform.translateX || 0, transform.translateY || 0),
    //         rotate(transform.rotateAngle || 0),
    //         scale(transform.scaleX || 1, transform.scaleY || 1)
    //     );

    //     // Transform origin point
    //     const newOrigin = applyToPoint(matrix, this.origin);
    //     this.origin.x = newOrigin.x;
    //     this.origin.y = newOrigin.y;

    //     // Scale radius (use average of X and Y scale since circle should stay circular)
    //     const scaleX = transform.scaleX || 1;
    //     const scaleY = transform.scaleY || 1;
    //     this.radius *= (scaleX + scaleY) / 2;

    //     // Add rotation to angles
    //     const rotation = transform.rotateAngle || 0;
    //     // Normalize angles to [0, 2π]
    //     const TWO_PI = Math.PI * 2;
    //     this.startAngle = ((this.startAngle + rotation) % TWO_PI + TWO_PI) % TWO_PI;
    //     this.endAngle = ((this.endAngle + rotation) % TWO_PI + TWO_PI) % TWO_PI;
    // }

    transform(transform: TransformData): void {
        console.log('arc transform', transform);
        const arcData = arcTransform(transform, this);
        this.origin.x = arcData.x;
        this.origin.y = arcData.y;
        this.radius = arcData.radius;
        this.startAngle = arcData.startAngle;
        this.endAngle = arcData.endAngle;
    }

}