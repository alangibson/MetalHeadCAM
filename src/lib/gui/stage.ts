import type { PointData } from "$lib/geometry/point/point.data";
import Konva from "konva";
import { inchesToPixels, mmToInches } from "./stage.function";

/**
 * Analgous to Konva.Stage
 */
export class StageGui {

    layers: LayerGuis = new LayerGuis();

    constructor(public konvaStage: Konva.Stage) {
        // konvaStage.container().style.backgroundColor = 'lightgray';
    }

    reorient(origin: PointData, mirror: PointData) {

        // Translate contents of stage so that origin is 0,0
        const boundingBox = this.konvaStage.getClientRect();
        // Calculate the translation needed to move boundingBox origin to target origin
        const dx = origin.x - boundingBox.x;
        const dy = origin.y - boundingBox.y;
        // Apply translation to all layers in the stage
        this.konvaStage.getLayers().forEach(layer => {
            // Also translate all shapes within each layer
            layer.getChildren().forEach(shape => {
                shape.fire('transformstart');
                // Handle Line shapes specially since they use points array
                if (shape instanceof Konva.Line) {
                    const points = shape.points();
                    for (let i = 0; i < points.length; i += 2) {
                        points[i] += dx;
                        points[i + 1] += dy;
                    }
                    shape.points(points);
                } else {
                    shape.position({x: shape.x() + dx, y: shape.y() + dy});
                }
                shape.fire('transformend');
            });
        });

        // Mirror x and y axis if needed
        if (mirror.y !== 0) {
            this.konvaStage.scaleY(-1);
            this.konvaStage.y(mirror.y);
        }
        // TODO x axis also?

        // Scale up based on drawing untis
        // TODO assuming mm here
        this.konvaStage.scaleX(this.konvaStage.scaleX() * inchesToPixels(mmToInches(1)));
        this.konvaStage.scaleY(this.konvaStage.scaleY() * inchesToPixels(mmToInches(1)));
        
        // Update stage
        this.konvaStage.batchDraw();
    }
}