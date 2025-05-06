import { Boundary } from "$lib/geometry/boundary/boundary";
import type { TransformData } from "$lib/geometry/transform/transform.data";
import type { Part } from "../part/part";

export class Plan {
    parts: Part[] = [];

    get boundary(): Boundary {
        return this.parts.reduce<Boundary>((bb, part) => bb.join(part.boundary),
            new Boundary({
                startPoint: { x: 0, y: 0 },
                endPoint: { x: 0, y: 0 },
            }))
    }

    transform(transform: TransformData): void {
        this.parts.forEach(part => part.transform(transform));
    }
}