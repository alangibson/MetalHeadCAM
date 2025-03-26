import type { Polyshape } from "$lib/geometry/polyshape/polyshape";
import { Arc } from "$lib/geometry/arc/arc";
import { Line } from "$lib/geometry/line/line";
import Konva from "konva";
import { ArcDirectionEnum } from "$lib/geometry/arc/arc.enum";

/**
 * Analogs:
 * - makerjs.paths.Line (many of them)
 * - paperjs CompoundPath
 * - fabricjs Polyline
 * - konvajs Konva.Path
 */
export class PolyshapeGui {

    constructor(private polyshape: Polyshape) {}

    toKonvaJs(): Konva.Shape {
        const data = this.buildPathData();
        return new Konva.Path({
            data,
            stroke: 'purple',
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round'
        });
    }

    private buildPathData(): string {
        let pathData = '';
        const shapes = this.polyshape.shapes;

        // Start path at first point
        const firstShape = shapes[0];
        pathData += `M ${firstShape.startPoint.x} ${firstShape.startPoint.y}`;

        // Add each shape to the path
        for (const shape of shapes) {
            if (shape instanceof Line) {
                const pathLine = ` L ${shape.endPoint.x} ${shape.endPoint.y}`;
                pathData += pathLine;
            } else if (shape instanceof Arc) {
                const rx = shape.radius;
                const ry = shape.radius;
                const xAxisRotation = 0;
                const largeArcFlag = Math.abs(shape.endAngle - shape.startAngle) > Math.PI ? 1 : 0;
                const sweepFlag = shape.direction == ArcDirectionEnum.CCW ? 0 : 1;
                const pathArc = ` A ${rx} ${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${shape.endPoint.x} ${shape.endPoint.y}`;
                pathData += pathArc;
            }
        }

        console.log('Polyshape.isClosed', this.polyshape.isClosed);
        if (this.polyshape.isClosed) {
            pathData += ' Z';
        }

        console.log('pathData', pathData);

        return pathData;
    }

}