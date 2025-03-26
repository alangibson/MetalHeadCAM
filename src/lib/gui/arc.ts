import type { Arc } from "$lib/geometry/arc/arc";
import { degreesToRadians, radiansToDegrees } from "$lib/geometry/arc/arc.function";
import Konva from "konva";

/**
 * Analogs:
 * - makerjs.paths.Arc
 * - paperjs Path.Arc
 * - fabricjs Circle with startAngle/endAngle or Path
 * - konvajs Konva.Arc
 */
export class ArcGui {

    constructor(private arc: Arc) {}

    toKonvaJs(): Konva.Shape {
        const konvaShape = new Konva.Arc({
            // geometry
            x: this.arc.origin.x,
            y: this.arc.origin.y,
            innerRadius: this.arc.radius,
            outerRadius: this.arc.radius,
            angle: radiansToDegrees(this.arc.endAngle - this.arc.startAngle),
            rotation: radiansToDegrees(this.arc.startAngle),
            // TODO arc.direction is still wrong for some arcs.
            // clockwise: this.arc.direction == ArcDirectionEnum.CW,
            // style
            stroke: 'red',
            strokeWidth: 1
        });

        // Update Geometry on Konva transformation
        konvaShape.on('transformend', () => {
            this.arc.radius = konvaShape.outerRadius(),
            this.arc.startAngle = degreesToRadians(konvaShape.rotation()),
            this.arc.endAngle = degreesToRadians(konvaShape.angle() + konvaShape.rotation()),
            this.arc.origin.x = konvaShape.x(),
            this.arc.origin.y = konvaShape.y()
        });

        konvaShape.on('pointerenter', () => console.log('pointerenter', this.arc.origin));

        return konvaShape;
    }

}