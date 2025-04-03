import type { Part } from "./part";

export class Parts implements Iterable<Part> {

    private parts: Part[] = [];

    add(layer: Part) {
        this.parts.push(layer);
    }
    
    [Symbol.iterator](): Iterator<Part> {
        return this.parts[Symbol.iterator]();
    }
}