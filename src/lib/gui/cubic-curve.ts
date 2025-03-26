import type { CubicCurve } from "$lib/geometry/cubic-curve/cubic-curve";
import Konva from "konva";

export class CubicCurveGui {

    constructor(private curve: CubicCurve) {
        this.curve = curve;
    }

    toKonvaJs(): Konva.Shape {
        const points: number[] = [
            this.curve.startPoint.x,
            this.curve.startPoint.y,
            this.curve.control1Point.x,
            this.curve.control1Point.y,
            this.curve.control2Point.x,
            this.curve.control2Point.y, 
            this.curve.endPoint.x,
            this.curve.endPoint.y
        ];

        const konvaShape = new Konva.Line({
            // geometry
            points: points,
            sceneFunc: (ctx, shape) => {
                ctx.beginPath();
                ctx.moveTo(this.curve.startPoint.x, this.curve.startPoint.y);
                ctx.bezierCurveTo(
                    this.curve.control1Point.x,
                    this.curve.control1Point.y,
                    this.curve.control2Point.x,
                    this.curve.control2Point.y,
                    this.curve.endPoint.x,
                    this.curve.endPoint.y
                );
                ctx.fillStrokeShape(shape);
            },
            // style
            stroke: 'lightblue',
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round'
        });

        // Update geometry when transformed
        konvaShape.on('transformend', () => {
            const points = konvaShape.points();
            this.curve.startPoint.x = points[0];
            this.curve.startPoint.y = points[1];
            this.curve.control1Point.x = points[2];
            this.curve.control1Point.y = points[3];
            this.curve.control2Point.x = points[4];
            this.curve.control2Point.y = points[5];
            this.curve.endPoint.x = points[6];
            this.curve.endPoint.y = points[7];
        });

        konvaShape.on('pointerenter', () => {
            console.log('pointerenter', {
                start: this.curve.startPoint,
                control1: this.curve.control1Point,
                control2: this.curve.control2Point,
                end: this.curve.endPoint
            });
        });

        return konvaShape;
    }

}
