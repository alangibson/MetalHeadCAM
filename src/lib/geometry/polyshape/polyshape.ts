import { Point } from "../point/point";
import type { Shape } from "../shape/shape";
import type { PolyshapeData } from "./polyshape.data";
import { polyshapeIsClosed } from "./polyshape.function";
import type { TransformData } from "../transform/transform.data";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import type { Boundary } from "../boundary/boundary";
import type { Geometry } from "../geometry/geometry";
import { polyshapeSample } from "./polyshape.function";

export class Polyshape implements PolyshapeData, Shape {
    
    type = GeometryTypeEnum.POLYSHAPE;
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

    get boundary(): Boundary {
        throw new Error("Method not implemented.");
    }

    transform(transform: TransformData): void {
        this.shapes.forEach(shape => shape.transform(transform));
    }

    contains(geometry: Geometry): boolean {
        throw new Error("Method not implemented.");
    }

    sample(sample: number = 20): Point[] {
        return polyshapeSample(this, sample).map(p => new Point(p));
    }

}