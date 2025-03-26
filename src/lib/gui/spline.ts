import type { Spline } from "$lib/geometry/spline/spline";
import Konva from "konva";

/**
 * Analogs:
 * - makerjs.models.BezierCurve
 * - paperjs ??
 * - fabricjs Path
 * - konvajs Konva.Line with tension property
 */
export class SplineGui {

    constructor(private spline: Spline) {}

    toKonvaJs(): Konva.Shape {
        const points: number[] = [];
        this.spline.controlPoints.forEach(point => {
            points.push(point.x);
            points.push(point.y); 
        });

        const konvaShape = new Konva.Line({
            // geometry
            points: points,
            tension: 0.5, // Makes it a curved spline
            bezier: true,
            // style
            stroke: 'blue',
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round'
        });

        // Update Geometry on Konva transformation
        konvaShape.on('transformend', () => {
            const points = konvaShape.points();
            for (let i = 0; i < points.length; i += 2) {
                this.spline.controlPoints[i/2].x = points[i];
                this.spline.controlPoints[i/2].y = points[i + 1];
            }
        });

        konvaShape.on('pointerenter', () => console.log('pointerenter', this.spline.controlPoints));

        return konvaShape;
    }

}