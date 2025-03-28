import type { Arc } from "$lib/geometry/arc/arc";
import { degreesToRadians, radiansToDegrees } from "$lib/geometry/arc/arc.function";
import Konva from "konva";
import type { Gui } from "./gui";

/**
 * Analogs:
 * - makerjs.paths.Arc
 * - paperjs Path.Arc
 * - fabricjs Circle with startAngle/endAngle or Path
 * - konvajs Konva.Arc
 */
export class ArcGui implements Gui {

    constructor(public geometry: Arc) {}

    toKonvaJs(): Konva.Shape {
        const konvaShape = new Konva.Arc({
            // geometry
            x: this.geometry.origin.x,
            y: this.geometry.origin.y,
            innerRadius: this.geometry.radius,
            outerRadius: this.geometry.radius,
            angle: radiansToDegrees(this.geometry.endAngle - this.geometry.startAngle),
            rotation: radiansToDegrees(this.geometry.startAngle),
            // TODO arc.direction is still wrong for some arcs.
            // clockwise: this.arc.direction == ArcDirectionEnum.CW,
            // style
            stroke: 'red',
            strokeWidth: 1,
        });

        // Remember the Gui object that created this shape
        konvaShape.setAttr('gui', this);

        // Update Geometry on Konva transformation
        konvaShape.on('transformend', () => {
            this.geometry.radius = konvaShape.outerRadius(),
            this.geometry.startAngle = degreesToRadians(konvaShape.rotation()),
            this.geometry.endAngle = degreesToRadians(konvaShape.angle() + konvaShape.rotation()),
            this.geometry.origin.x = konvaShape.x(),
            this.geometry.origin.y = konvaShape.y()
        });
        
        return konvaShape;
    }

}