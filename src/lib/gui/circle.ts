import type { Circle } from "$lib/geometry/circle/circle";
import Konva from "konva";

/**
 * Analog:
 * - makerjs.paths.Circle
 * - paperjs Shape.Circle or Path.Circle
 * - fabricjs Circle
 * - konvajs Konva.Circle
 */
export class CircleGui {

    constructor(private circle: Circle) {}

    toKonvaJs(): Konva.Shape {
        const konvaShape = new Konva.Circle({
            // Geometry
            x: this.circle.origin.x,
            y: this.circle.origin.y,
            radius: this.circle.radius,
            // style
            stroke: 'green',
            strokeWidth: 1
        });

        konvaShape.on('transformend', () => {
            this.circle.origin.x = konvaShape.x(),
            this.circle.origin.y = konvaShape.y(),
            this.circle.radius = konvaShape.radius()
        });

        konvaShape.on('pointerenter', () => console.log('pointerenter', this.circle.origin));

        return konvaShape;
    }

}