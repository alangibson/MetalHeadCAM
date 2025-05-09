import { Boundary } from "$lib/geometry/boundary/boundary";
import type { TransformData } from "$lib/geometry/transform/transform.data";
import type { Part } from "../part/part";
import { Rapid } from "../rapid/rapid";
import { solve } from '@wemap/salesman.js';
import type { Point } from "$lib/geometry/point/point";
import type { KerfPositionEnum } from "../cut/cut.enum";

export class Plan {
    
    parts: Part[];

    constructor(parts: Part[]) {
        this.parts = parts;
    }

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

    updateRapids(): void {
        // First update rapids within each part
        this.parts.forEach(part => part.updateRapids());

        // Collect all shell start points from parts
        const points: Point[] = this.parts.map(part => part.shell.startPoint);

        // Solve TSP to get optimal path between parts
        const solution: number[] = solve(points);

        // Create rapid from origin to first part's first cut
        const firstPart = this.parts[solution[0]];
        const firstRapid = new Rapid({
            startPoint: { x: 0, y: 0 },
            endPoint: firstPart.cuts[0].startPoint
        });
        firstPart.cuts[0].rapidIn = firstRapid;

        // Create rapids between parts in the order determined by TSP
        for (let i = 0; i < solution.length - 1; i++) {
            const currentPart = this.parts[solution[i]];
            const nextPart = this.parts[solution[i + 1]];
            
            // Create rapid from current part's shell end to next part's first cut start
            const rapid: Rapid = new Rapid({
                startPoint: currentPart.shell.endPoint,
                endPoint: nextPart.cuts[0].startPoint
            });

            // Assign rapid to the next part's first cut
            nextPart.cuts[0].rapidIn = rapid;
        }

        // Reorder this.parts to match the rapid order
        this.parts = solution.map(index => this.parts[index]);
    }

    kerf(width: number, includeOpenShapes: boolean): void {
        this.parts.forEach(part => part.kerf(width, includeOpenShapes));
    }
}