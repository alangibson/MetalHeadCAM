import type { Layer } from "./layer";

export class Layers implements Iterable<Layer> {

    private layers: Layer[] = [];

    add(layer: Layer) {
        this.layers.push(layer);
    }
    
    [Symbol.iterator](): Iterator<Layer> {
        return this.layers[Symbol.iterator]();
    }

    get length() {
        return this.layers.length;
    }
}