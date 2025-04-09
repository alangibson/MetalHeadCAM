import type { Geometry } from "$lib/geometry/geometry/geometry";

export class Layer {
    
    name: string = "0";
    geometries: Geometry[] = [];
    
    add(geometry: Geometry) {
        this.geometries.push(geometry);
    }

}