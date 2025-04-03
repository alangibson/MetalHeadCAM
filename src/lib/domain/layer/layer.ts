import type { Geometry } from "$lib/geometry/geometry/geometry";

export class Layer {
    
    geometries: Geometry[] = [];
    
    add(geometry: Geometry) {
        this.geometries.push(geometry);
    }

}