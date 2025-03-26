import type { QuadraticCurve } from "$lib/geometry/quadratic-curve/quadratic-curve";
import Konva from "konva";

export class QuadraticCurveGui {

    constructor(private curve: QuadraticCurve) {
        this.curve = curve;
    }

    toKonvaJs(): Konva.Shape {
        const points: number[] = [
            this.curve.startPoint.x,
            this.curve.startPoint.y,
            this.curve.controlPoint.x, 
            this.curve.controlPoint.y,
            this.curve.endPoint.x,
            this.curve.endPoint.y
        ];

        const konvaShape = new Konva.Line({
            // geometry
            points: points,
            sceneFunc: (ctx, shape) => {
                ctx.beginPath();
                ctx.moveTo(this.curve.startPoint.x, this.curve.startPoint.y);
                ctx.quadraticCurveTo(
                  this.curve.controlPoint.x,
                  this.curve.controlPoint.y,
                  this.curve.endPoint.x,
                  this.curve.endPoint.y
                );
                ctx.fillStrokeShape(shape);
              },
            // style
            stroke: 'darkblue',
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round'
        });

        // Update geometry when transformed
        konvaShape.on('transformend', () => {
            const points = konvaShape.points();
            this.curve.startPoint.x = points[0];
            this.curve.startPoint.y = points[1];
            this.curve.controlPoint.x = points[2];
            this.curve.controlPoint.y = points[3]; 
            this.curve.endPoint.x = points[4];
            this.curve.endPoint.y = points[5];
        });

        konvaShape.on('pointerenter', () => {
            console.log('pointerenter', {
                start: this.curve.startPoint,
                control: this.curve.controlPoint,
                end: this.curve.endPoint
            });
        });

        return konvaShape;
    }

}