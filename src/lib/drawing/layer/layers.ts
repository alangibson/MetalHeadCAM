import type { LayerGui } from "./layer";

export class LayerGuis implements Iterable<LayerGui> {

    private layers: LayerGui[] = [];

    add(layer: LayerGui) {
        this.layers.push(layer);
    }
    
    [Symbol.iterator](): Iterator<LayerGui> {
        return this.layers[Symbol.iterator]();
    }
}