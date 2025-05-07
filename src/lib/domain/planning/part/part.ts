import { Entity } from "$lib/entity";
import { Boundary } from "$lib/geometry/boundary/boundary";
import type { TransformData } from "$lib/geometry/transform/transform.data";
import type { Cut } from "../cut/cut";
import { solve } from '@wemap/salesman.js';
import { Rapid } from "../rapid/rapid";

export class Part extends Entity {
    shell: Cut;
	holes: Cut[] = [];
    _cuts: Cut[] = [];

    constructor({ shell, holes }: Part) {
		super();
		this.shell = shell;
		this.holes = holes;
        this._cuts.push(...this.holes, this.shell);
	}

	get cuts(): Cut[] {
		return this._cuts;
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

    updateRapids(): void {
        // If there are no holes, no need for rapids
        if (this.holes.length === 0) return;

        // First solve TSP for just the holes
        const holePoints = this.holes.map(hole => hole.startPoint);
        const holeSolution = solve(holePoints);

        // Create rapids between holes
        for (let i = 0; i < holeSolution.length - 1; i++) {
            const currentPoint = holePoints[holeSolution[i]];
            const nextPoint = holePoints[holeSolution[i + 1]];
            
            // Create rapid from current hole to next hole
            const rapid = new Rapid({
                startPoint: currentPoint,
                endPoint: nextPoint
            });

            // Assign rapid to the next hole
            this.holes[holeSolution[i + 1]].rapidIn = rapid;
        }

        // Create rapid from last hole to shell
        const lastHolePoint = holePoints[holeSolution[holeSolution.length - 1]];
        const shellRapid = new Rapid({
            startPoint: lastHolePoint,
            endPoint: this.shell.startPoint
        });
        this.shell.rapidIn = shellRapid;

        // Reorder this._cuts to match the rapid order
        this._cuts = [
            ...holeSolution.map(index => this.holes[index]),
            this.shell
        ];
    }
}