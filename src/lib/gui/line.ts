import type { Line } from "$lib/geometry/line/line";
import Konva from "konva";

/**
 * Analogs:
 * - makerjs.paths.Line
 * - paperjs Path.Line
 * - fabricjs Path
 * - konvajs Konva.Line
 */
export class LineGui {

    constructor(private line: Line) {}

    toKonvaJs(): Konva.Shape {
        const konvaShape = new Konva.Line({
            // geometry
            points: [
                this.line.startPoint.x,
                this.line.startPoint.y,
                this.line.endPoint.x,
                this.line.endPoint.y
            ],
            // style
            stroke: 'orange',
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round'
        });

        // Update Geometry on Konva transformation
        konvaShape.on('transformend', () => {
            this.line.startPoint.x = konvaShape.points()[0];
            this.line.startPoint.y = konvaShape.points()[1];
            this.line.endPoint.x = konvaShape.points()[2];
            this.line.endPoint.y = konvaShape.points()[3];
        });

        konvaShape.on('pointerenter', () => console.log('pointerenter', this.line.startPoint, this.line.endPoint));

        return konvaShape;
    }

}