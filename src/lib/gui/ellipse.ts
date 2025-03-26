import { radiansToDegrees } from "$lib/geometry/arc/arc.function";
import type { Ellipse } from "$lib/geometry/ellipse/ellipse";
import Konva from "konva";

/**
 * Analogs:
 * - makerjs.models.Ellipse
 * - paperjs Shape.Ellipse or Path.Ellipse
 * - fabricjs Ellipse
 * - konvajs Konva.Ellipse
 */
export class EllipseGui {

    constructor(private ellipse: Ellipse) {}

    toKonvaJs(): Konva.Shape {
        return new Konva.Ellipse({
            // geometry
            x: this.ellipse.origin.x,
            y: this.ellipse.origin.y,
            radiusX: this.ellipse.majorLength,
            radiusY: this.ellipse.minorLength,
            rotation: radiansToDegrees(this.ellipse.rotation),
            // style
            stroke: 'black',
            strokeWidth: 1
        });
    }

}