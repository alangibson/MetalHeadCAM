import type { TransformData } from "../transform/transform.data";

export interface Geometry {
    type: string;
    transform(data: TransformData): void;
}