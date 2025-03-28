import type { Geometry } from "$lib/geometry/geometry/geometry";
import type Konva from "konva";

export interface Gui {

    geometry: Geometry;

    toKonvaJs(): Konva.Shape;

}