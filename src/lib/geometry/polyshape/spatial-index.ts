import type { LineData } from "../line/line.data";
import type { PointData } from "../point/point.data";

/**
 * Simple spatial index for line segments using grid cells
 */
export class SpatialIndex {
    private cells: Map<string, LineData[]>;
    private cellSize: number;

    constructor(points: PointData[], cellSize: number = 100) {
        this.cells = new Map<string, LineData[]>();
        this.cellSize = cellSize;
        this.buildIndex(points);
    }

    private buildIndex(points: PointData[]): void {
        // Add line segments to cells they intersect
        for (let i = 0; i < points.length - 1; i++) {
            const segment: LineData = {
                startPoint: points[i],
                endPoint: points[i + 1]
            };

            const minX = Math.floor(Math.min(segment.startPoint.x, segment.endPoint.x) / this.cellSize);
            const maxX = Math.floor(Math.max(segment.startPoint.x, segment.endPoint.x) / this.cellSize);
            const minY = Math.floor(Math.min(segment.startPoint.y, segment.endPoint.y) / this.cellSize);
            const maxY = Math.floor(Math.max(segment.startPoint.y, segment.endPoint.y) / this.cellSize);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const key = `${x},${y}`;
                    if (!this.cells.has(key)) {
                        this.cells.set(key, []);
                    }
                    this.cells.get(key)!.push(segment);
                }
            }
        }
    }

    query(minX: number, minY: number, maxX: number, maxY: number): LineData[] {
        const result = new Set<LineData>();
        
        const gridMinX = Math.floor(minX / this.cellSize);
        const gridMaxX = Math.floor(maxX / this.cellSize);
        const gridMinY = Math.floor(minY / this.cellSize);
        const gridMaxY = Math.floor(maxY / this.cellSize);

        for (let x = gridMinX; x <= gridMaxX; x++) {
            for (let y = gridMinY; y <= gridMaxY; y++) {
                const key = `${x},${y}`;
                const segments = this.cells.get(key);
                if (segments) {
                    segments.forEach(s => result.add(s));
                }
            }
        }

        return Array.from(result);
    }
}
