import { DEFAULT_COINCIDENCE_TOLERANCE } from "$lib/input/config/defaults";
import type { Geometry } from "../geometry/geometry";
import { GeometryTypeEnum } from "../geometry/geometry.enum";
import type { TransformData } from "../transform/transform.data";
import type { PointData } from "./point.data";
import { pointTransform } from "./point.function";
import { pointCoincident } from "./point.function";

export class Point implements PointData, Geometry {

    type = GeometryTypeEnum.POINT;
    x: number;
    y: number;

    constructor(props: PointData) {
        this.x = props.x;
        this.y = props.y;
    }

    /**
     * Points are the same within a given tolerance.
     */
    coincident(thatPoint: PointData, tolerance: number = DEFAULT_COINCIDENCE_TOLERANCE): boolean {
        return pointCoincident(this, thatPoint, tolerance);
    }
    
    transform(transform: TransformData): void {
        const transformed = pointTransform(transform, this);
        this.x = transformed.x;
        this.y = transformed.y;
    }

}