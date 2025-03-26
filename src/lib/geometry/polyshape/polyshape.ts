import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { PolyshapeData } from "./polyshape.data";
import { polyshapeIsClosed } from "./polyshape.function";
import type { TransformData } from "../transform/transform.data";

export class Polyshape implements PolyshapeData, Shape {
    
    shapes: Shape[];
    
    constructor(data: PolyshapeData) {
        this.shapes = data.shapes;
    }

    get startPoint(): Point {
        return new Point(this.shapes[0].startPoint);
    }

    get endPoint(): Point {
        return new Point(this.shapes[this.shapes.length - 1].endPoint);
    }

    get isClosed(): boolean {
        return polyshapeIsClosed(this);
    }

    transform(transform: TransformData): void {
        this.shapes.forEach(shape => shape.transform(transform));
    }
}