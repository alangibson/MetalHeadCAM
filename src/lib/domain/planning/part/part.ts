import { Entity } from "$lib/entity";
import { Boundary } from "$lib/geometry/boundary/boundary";
import type { TransformData } from "$lib/geometry/transform/transform.data";
import type { Cut } from "../cut/cut";

export class Part extends Entity {
    shell: Cut;
	holes: Cut[] = [];

    constructor({ shell, holes }: Part) {
		super();
		this.shell = shell;
		this.holes = holes;
	}

	get cuts(): Cut[] {
		return [this.shell, ...this.holes];
	}

	get boundary(): Boundary {
        return this.cuts.reduce<Boundary>((bb, cut) => bb.join(cut.boundary),
            new Boundary({
                startPoint: { x: 0, y: 0 },
                endPoint: { x: 0, y: 0 },
            }))
    }

    transform(transform: TransformData): void {
        this.cuts.forEach(cut => cut.transform(transform));
    }
}