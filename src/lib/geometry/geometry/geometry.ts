import { Entity } from "$lib/entity";
import type { TransformData } from "../transform/transform.data";

export abstract class Geometry extends Entity {
    abstract type: string;
    abstract transform(data: TransformData): void;
    abstract clone(): Geometry;
}