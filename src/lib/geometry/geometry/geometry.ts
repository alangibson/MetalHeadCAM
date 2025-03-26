import type { TransformData } from "../transform/transform.data";

export interface Geometry {
    transform(data: TransformData): void;
}