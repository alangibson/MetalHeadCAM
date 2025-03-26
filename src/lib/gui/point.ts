import type { Point } from "$lib/geometry/point/point";
import Konva from "konva";

/**
 * Analogs:
 * - makerjs ???
 * - paperjs Point
 * - fabricjs Point
 * - konvajs Konva.Circle with small radius
 */
export class PointGui {

    constructor(private point: Point) {}

    toKonvaJs(): Konva.Shape {
        // TODO set very small radius
        return new Konva.Circle({
            
        });
    }

    onDrag() { }

    onTransform() { }
}