import type { Point } from "$lib/geometry/point/point";
import Konva from "konva";
import type { Gui } from "./gui";

/**
 * Analogs:
 * - makerjs ???
 * - paperjs Point
 * - fabricjs Point
 * - konvajs Konva.Circle with small radius
 */
export class PointGui implements Gui {

    constructor(public geometry: Point) {}

    toKonvaJs(): Konva.Shape {
        // TODO set very small radius
        return new Konva.Circle({
            
        });
    }

}