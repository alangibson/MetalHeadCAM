// Define the type for stage state
export interface StageState {
    zoomBy: number;
    zoom(zoomBy: number): void;
}

// Factory function to create new stage state
export function createStageState(): StageState {
    return {
        zoomBy: 1.0,
        zoom(zoomBy: number) {
            this.zoomBy = zoomBy;
        }
    };
}
